import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";
import { StatefulButton } from "./button";
import { Input } from "./input";
import { cn } from "../../lib/cn";

export type LoginStatus = "idle" | "loading" | "success" | "error";

export type LoginValues = {
  email: string;
  password: string;
};

export type LoginErrors = Partial<Record<keyof LoginValues, string>>;

export type LoginFormClassNames = {
  root?: string;
  header?: string;
  title?: string;
  description?: string;
  fields?: string;
  submit?: string;
  footer?: string;
};

export interface LoginFormProps {
  /** Controlled values. Omit for uncontrolled. */
  values?: LoginValues;
  defaultValues?: Partial<LoginValues>;
  onValuesChange?: (values: LoginValues) => void;
  /** Called with valid values only. Return a promise to drive the button state. */
  onSubmit?: (values: LoginValues) => void | Promise<void>;
  /** Replace the built-in rules — return a message per invalid field. */
  validate?: (values: LoginValues) => LoginErrors;
  /** Controlled submit state. Omit to let the form track it. */
  status?: LoginStatus;
  /** Form-level failure message, shown above the submit button. */
  errorMessage?: string;
  title?: ReactNode;
  description?: ReactNode;
  submitLabel?: string;
  footer?: ReactNode;
  className?: string;
  classNames?: LoginFormClassNames;
}

const EMPTY_VALUES: LoginValues = {
  email: "",
  password: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function defaultValidate(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {};

  if (!values.email.trim()) {
    errors.email = "Enter your email.";
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Enter your password.";
  }

  return errors;
}

export function LoginForm({
  values: valuesProp,
  defaultValues,
  onValuesChange,
  onSubmit,
  validate,
  status: statusProp,
  errorMessage,
  title,
  description,
  submitLabel = "Sign In",
  footer,
  className,
  classNames,
}: LoginFormProps) {
  const reduce = useReducedMotion();
  const baseId = useId();

  const controlled = valuesProp !== undefined;
  const [internalValues, setInternalValues] = useState<LoginValues>({
    ...EMPTY_VALUES,
    ...defaultValues,
  });
  const values = controlled ? valuesProp : internalValues;

  const [internalStatus, setInternalStatus] = useState<LoginStatus>("idle");
  const status = statusProp ?? internalStatus;

  const [revealPassword, setRevealPassword] = useState(false);

  // "Reward early, punish late": errors calculated, but only shown once field is blurred or submit clicked
  const [touched, setTouched] = useState<Partial<Record<keyof LoginValues, boolean>>>({});

  const errors = useMemo(
    () => (validate ?? defaultValidate)(values),
    [values, validate],
  );

  const setValue = useCallback(
    <K extends keyof LoginValues>(key: K, next: LoginValues[K]) => {
      const nextValues = { ...values, [key]: next };
      if (!controlled) {
        setInternalValues(nextValues);
        if (statusProp === undefined) {
          setInternalStatus((current) =>
            current === "success" || current === "error" ? "idle" : current,
          );
        }
      }
      onValuesChange?.(nextValues);
    },
    [controlled, onValuesChange, statusProp, values],
  );

  const touch = useCallback((key: keyof LoginValues) => {
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);

  const shownError = (key: keyof LoginValues) =>
    touched[key] ? errors[key] : undefined;

  const isValid = (key: keyof LoginValues) =>
    Boolean(touched[key]) && !errors[key] && Boolean(values[key]);

  const isSubmitting = status === "loading";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setTouched({
      email: true,
      password: true,
    });

    if (Object.keys(errors).length > 0) return;
    if (!onSubmit) return;

    if (statusProp === undefined) setInternalStatus("loading");
    try {
      await onSubmit(values);
      if (statusProp === undefined) setInternalStatus("success");
    } catch {
      if (statusProp === undefined) setInternalStatus("error");
    }
  };

  const formErrorId = `${baseId}-login-error`;

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className={cn("motion-signup-form", className, classNames?.root)}
    >
      {title || description ? (
        <div className={cn("motion-form-header", classNames?.header)}>
          {title ? (
            <h2 className={cn("motion-form-title", classNames?.title)}>
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className={cn("motion-form-description", classNames?.description)}>
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className={cn("motion-form-fields", classNames?.fields)}>
        <Input
          label="Email Address"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="developer@example.com"
          leftIcon={<Mail size={16} />}
          disabled={isSubmitting}
          value={values.email}
          onChange={(next) => setValue("email", next)}
          onBlur={() => touch("email")}
          error={shownError("email")}
          reserveErrorLine
          success={isValid("email")}
        />

        <Input
          label="Password"
          type={revealPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your password"
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setRevealPassword((prev) => !prev)}
              aria-label={revealPassword ? "Hide password" : "Show password"}
              className="motion-password-toggle-btn"
            >
              {revealPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          disabled={isSubmitting}
          value={values.password}
          onChange={(next) => setValue("password", next)}
          onBlur={() => touch("password")}
          error={shownError("password")}
          reserveErrorLine
        />
      </div>

      <AnimatePresence initial={false}>
        {errorMessage ? (
          <motion.p
            id={formErrorId}
            role="alert"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="motion-form-banner-error"
          >
            {errorMessage}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <StatefulButton
        type="submit"
        size="lg"
        state={status}
        loadingText="Signing in..."
        successText="Signed in!"
        errorText="Try again"
        aria-describedby={errorMessage ? formErrorId : undefined}
        className={cn("motion-form-submit-btn", classNames?.submit)}
      >
        {submitLabel}
      </StatefulButton>

      {footer ? (
        <div className={cn("motion-form-footer", classNames?.footer)}>
          {footer}
        </div>
      ) : null}
    </form>
  );
}
