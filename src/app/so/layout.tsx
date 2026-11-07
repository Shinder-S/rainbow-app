import { SoShell } from "@/components/SoShell";

export default function SoLayout({ children }: { children: React.ReactNode }) {
  return <SoShell>{children}</SoShell>;
}
