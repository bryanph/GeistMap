import React, { PropTypes } from 'react'

export const SocialAuth = (props) => (
    <div>
        {
            props.oauthTwitter ?
                <a className="button input-height twitter" href="/auth/signup/twitter">
                <i className="fa fa-twitter fa-lg" />With Twitter
                </a>
                    : null 
        }
        {
            props.oauthGitHub ?
                <a className="button input-height github" href="/auth/signup/github">
                <i className="fa fa-github fa-lg" />With Github
                </a>
                    : null 
        }
        {
            props.oauthFacebook ?
                <a className="button input-height facebook" href="/auth/signup/facebook">
                <i className="fa fa-facebook fa-lg" />With Facebook
                </a>
                    : null 
        }
        {
            props.oauthGoogle ?
                <a className="button input-height google" href="/auth/signup/google">
                <i className="fa fa-google fa-lg" />With Google
                </a>
                    : null 
        }
        {
            props.oauthTumblr ?
                <a className="button" href="/auth/signup/tumblr">
                <i className="fa fa-tumblr fa-lg" /> Tumblr
                </a>
                    : null 
        }
    </div>
)
SocialAuth.propTypes = {
    oauthMessage: PropTypes.string,
    oauthTwitter: PropTypes.bool.isRequired,
    oauthGitHub: PropTypes.bool.isRequired,
    oauthFacebook: PropTypes.bool.isRequired,
    oauthGoogle: PropTypes.bool.isRequired,
    oauthTumblr: PropTypes.bool.isRequired,
}

export default SocialAuth
