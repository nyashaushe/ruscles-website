import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { googleAuthService } from "./auth/google-auth-service"
import { AdminEmailValidator } from "./auth/email-validator"

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            id: "credentials",
            name: "Email and Password",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "admin@example.com"
                },
                password: {
                    label: "Password",
                    type: "password",
                    placeholder: "Enter your password"
                }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('CredentialsSignin');
                }

                try {
                    // Validate email format and authorization
                    const emailValidation = AdminEmailValidator.validateEmail(credentials.email);
                    if (!emailValidation.isValid) {
                        console.log('Email validation failed:', emailValidation.error);

                        // Throw specific error based on validation failure
                        if (emailValidation.error?.includes('not authorized')) {
                            throw new Error('AccessDenied');
                        }
                        throw new Error('CredentialsSignin');
                    }

                    // Authenticate with Google service
                    const user = await googleAuthService.validateCredentials(
                        credentials.email,
                        credentials.password
                    );

                    if (user) {
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            image: user.image,
                        };
                    }

                    throw new Error('CredentialsSignin');
                } catch (error) {
                    console.error('Credentials authentication error:', error);

                    // Map service errors to NextAuth errors
                    if (error instanceof Error) {
                        switch (error.message) {
                            case 'EMAIL_NOT_AUTHORIZED':
                                throw new Error('AccessDenied');
                            case 'INVALID_EMAIL_FORMAT':
                            case 'PASSWORD_TOO_SHORT':
                            case 'EMAIL_PASSWORD_REQUIRED':
                                throw new Error('CredentialsSignin');
                            case 'NETWORK_ERROR':
                            case 'SERVICE_UNAVAILABLE':
                                throw new Error('Configuration');
                            case 'AUTHENTICATION_FAILED':
                            default:
                                throw new Error('CredentialsSignin');
                        }
                    }

                    throw new Error('CredentialsSignin');
                }
            }
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // For credentials provider, authorization is already handled in the authorize function
            if (account?.provider === "credentials") {
                return true;
            }

            // For OAuth providers (like Google), check email authorization
            if (user.email) {
                const emailValidation = AdminEmailValidator.validateEmail(user.email);
                if (emailValidation.isValid) {
                    return true;
                }

                console.log('OAuth signin denied:', emailValidation.error);
            }

            return false; // Deny access to unauthorized emails
        },
        async jwt({ token, user, account }) {
            // Persist user data in the token
            if (user) {
                token.user = user
            }
            return token
        },
        async session({ session, token }) {
            // Send properties to the client
            if (token.user) {
                session.user = token.user as any
            }
            return session
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
}



