export function passwordError(pw: string): string | null {
  if (pw.length < 8) return "La contraseña tiene que tener al menos 8 caracteres.";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "La contraseña tiene que tener letras y números.";
  return null;
}

export function usernameError(u: string): string | null {
  if (!/^[a-zA-Z0-9_.]{3,20}$/.test(u))
    return "El usuario debe tener 3 a 20 caracteres: letras, números, _ o .";
  return null;
}
