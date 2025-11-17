export const formatValidationError = errors => {
  if (!errors || !errors.issues) return 'Validation failed';

  if (Array.isArray(errors.issues) && errors.issues.length > 0) {
    return errors.issues
      .map(i => i.message || i.path.join('.') + ' is invalid')
      .join(', ');
  }

  return JSON.stringify(errors);
};
