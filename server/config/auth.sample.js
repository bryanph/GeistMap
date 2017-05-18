
const auth = {
    oauth: {
        twitter: {
            key: "",
            secret: "",
            callbackUrl: "/auth/signup/twitter/callback",
        },
        github: {
            key: "",
            secret: "",
            callbackUrl: "/auth/signup/github/callback",
        },
        google: {
            key: "",
            secret: "",
            callbackUrl: "/auth/signup/google/callback/",
        },
        facebook: {
            key: "",
            secret: "",
            callbackUrl: "/auth/signup/facebook/callback/",
        },
    },
    "loginAttempts": {
        forIp: 50,
        forIpAndUser: 7,
        logExpiration: '20m'
    },
    "authTemplate": 'auth.jade',
    "appUrl": '/app',
    "mainRoute": "auth",
    "companyName": "Bryan Haakman",
    "projectName": "Geist",
    "version": "0.1",
    "systemEmail": "noreply@geist.fyi",
    "supportEmail": "support@geist.fyi",
    "cryptoKey": "TODO change",
    "requireAccountVerification": true,
    "smtp": {
        from: {
            name: process.env.SMTP_FROM_NAME || 'Geist team',
            address: process.env.SMTP_FROM_ADDRESS || 'noreply@geist.fyi'
        },
        credentials: {
            user: process.env.SMTP_USERNAME || 'user',
            password: process.env.SMTP_PASSWORD || 'password',
            host: process.env.SMTP_HOST || '192.168.1.1',
            ssl: false,
            tls: true,
            port: 25,
        }
    },
}

module.exports = auth
