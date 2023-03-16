export const transformCapitalize = (str: string): string => {
  const aStr: string[] = str.split(' ');
  const wordCapitalize = aStr.reduce(function (acc, current): string {
    return (
      acc +
      current.charAt(0).toUpperCase() +
      current.slice(1).toLowerCase() +
      ' '
    );
  }, '');
  return wordCapitalize.trimEnd();
};
