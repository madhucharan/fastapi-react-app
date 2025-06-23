import React from "react";
import { SignedIn, SignedOut, SignIn, SignUp } from "@clerk/clerk-react";

const AuthenticationPage = () => {
  return (
    <div className="auth-container">
      <SignedOut>
        <SignIn routing="path" path="/sign-in" />
        <SignUp routing="path" path="/sign-up" />
      </SignedOut>

      <SignedIn>
        <div className="redirect-message">
          <p>You are signed in</p>
        </div>
      </SignedIn>
    </div>
  );
};

export default AuthenticationPage;
