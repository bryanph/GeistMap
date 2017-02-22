

export function isVerified(req, res, next) {
    if (req.user && req.user.canPlayRoleOf('account')) {
        if (req.app.config.requireAccountVerification) {
            if (req.user.roles.account.isVerified !== 'yes' && !/^\/account\/verification\//.test(req.url)) {
                return false
            }
        }
    }

    return true
}

// authentication middleware
export function ensureAuthenticated(req, res, next) { 
    if (req.isAuthenticated()) {
        return next();
    }

    return res.redirect('/auth/login')
}

export function ensureVerified(req, res, next) {
    if (req.isAuthenticated() && isVerified(req, res)) {
        return next()
    } 

    return res.redirect('/auth/login')
}


/*
 * Authentication
*/
export function ensureAccount(req, res, next) {
    if (req.user.canPlayRoleOf('account')) {
        if (req.app.config.requireAccountVerification) {
            if (req.user.roles.account.isVerified !== 'yes' && !/^\/account\/verification\//.test(req.url)) {
                return res.redirect('/auth/account/verification');
            }
        }
        return next();
    }
    res.redirect('/');
}

export function ensureAdmin(req, res, next) {
    console.log(req.user);
    console.log(req.user.canPlayRoleOf('admin'));
    console.log('called ensureAdmin...');
    if (req.user && req.user.canPlayRoleOf('admin')) {
        return next();
    }
    res.redirect('/');
}


/*
 * for /auth/*
*/
export function authFlow(req, res, next){
    console.log('CALLED');
    console.log(isVerified(req, res));
    if (req.isAuthenticated() && isVerified(req, res)) {
        console.log('redirecting to app');
        return res.redirect('/app')
    } 
    else if (req.isAuthenticated()) {
        console.log('redirecting to verification page');
        // TODO: implement email verification - 2016-05-10
        // return res.redirect('/app')
        return res.redirect('/auth/account/verification')
    }

    next();
};

/*
 * for verification page
*/
export function verificationFlow(req, res, next) {
    if (req.isAuthenticated() && isVerified(req, res)) {
        return res.redirect('/app')
    } 
    else if (!req.isAuthenticated()) {
        res.redirect('/auth/signup')
    }

    return next()
}

