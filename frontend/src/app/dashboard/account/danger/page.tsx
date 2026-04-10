import { redirect } from "next/navigation";

// Profil et Compte fusionnés — redirection vers /dashboard/account
export default function DangerRedirect() {
    redirect("/dashboard/account");
}
