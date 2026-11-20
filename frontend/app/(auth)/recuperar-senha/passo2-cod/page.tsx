import { PasswordRecoveryCodeForm } from "@/components/auth/PasswordRecoveryCodeForm";

type PageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { email = "" } = await searchParams;
  return <PasswordRecoveryCodeForm email={email} />;
}
