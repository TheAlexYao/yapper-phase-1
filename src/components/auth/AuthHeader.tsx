import { LogoutButton } from "./LogoutButton";

export const AuthHeader = () => {
  return (
    <header className="fixed top-0 right-0 p-4 z-50">
      <LogoutButton />
    </header>
  );
};