export const loader = () => {
  return new Response(
    `${new Date().toLocaleTimeString()} ${new Date().getTimezoneOffset()}`
  );
};
