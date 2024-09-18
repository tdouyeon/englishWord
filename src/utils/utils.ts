export const isNotEmpty = (values: string | string[]) => {
  if (typeof values === 'string') {
    if (values) {
      return true;
    }
    return false;
  } else if (Array.isArray(values)) {
    values.every(value => {
      value !== '';
    });
  } else {
    return false;
  }
};
