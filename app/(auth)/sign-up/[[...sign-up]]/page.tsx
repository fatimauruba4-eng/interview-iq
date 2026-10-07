
import { SignUp } from "@clerk/nextjs";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function SignUpPage() {
  return (
    <div
      className={poppins.className}
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f7f5",
      }}
    >
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "font-[inherit]",
            card: "font-[inherit]",
            headerTitle: "font-[inherit]",
            headerSubtitle: "font-[inherit]",
            formFieldLabel: "font-[inherit]",
            formFieldInput: "font-[inherit]",
            formButtonPrimary: "font-[inherit]",
            footerActionLink: "font-[inherit]",
            socialButtonsBlockButton: "font-[inherit]",
          },
        }}
      />
    </div>
  );
}

