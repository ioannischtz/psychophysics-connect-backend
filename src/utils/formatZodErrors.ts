import { ZodError } from "zod";

type FormattedError = {
  path: string;
  message: string;
  code: string;
};

const formatZodInnerError = (error: ZodError<any>): FormattedError[] => {
  const formattedErrors: FormattedError[] = [];
  for (const issue of error.issues) {
    const formattedError: FormattedError = {
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    };
    formattedErrors.push(formattedError);
  }
  // console.log("formatZodInnerError, formattedErrors:", formattedErrors);
  return formattedErrors;
};

const formatZodErrors = (zodError: ZodError<any>) => ({
  errors: formatZodInnerError(zodError),
  message: zodError.message,
});

export { formatZodErrors };
