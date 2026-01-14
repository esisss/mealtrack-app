"use server";

import { redirect } from "next/navigation";
import { stackServerApp } from "../server";

export async function signInAsGuest() {
    const email = process.env.GUEST_AUTH_CREDENTIAL_MAIL;
    const password = process.env.GUEST_AUTH_CREDENTIAL_PASS;


    if (!password || !email) {
        throw new Error(
            "Missing guest credentials: check GUEST_AUTH_CREDENTIAL_MAIL / GUEST_AUTH_CREDENTIAL_PASSWORD in env"
        );
    }
    const authResult = await stackServerApp.signInWithCredential({ email, password })

}
