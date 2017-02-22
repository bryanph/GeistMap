import React, { PropTypes } from 'react'
import classNames from 'classnames'

import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import ActionAndroid from 'material-ui/svg-icons/action/android';
import FontIcon from 'material-ui/FontIcon';

const styles = {
    button: {
        width: '100%'
    },
    twitter: {
        color: "#55ACEE"
    },
    facebook: {
        color: "#3B5998"
    },
    google: {
        color: "#DD4B39"
    },
    github: {
        color: "#4183C4"
    },
}

const SocialButton = (props) => (
    <FlatButton
        label={props.label}
        href={props.href}
        style={styles.button}
        labelStyle={props.style}
        icon={props.icon}
    />
)

export const SocialAuth = (props) => (
    <div>
        {
            props.oauthTwitter ?
                <SocialButton
                    label="Twitter"
                    href="/auth/signup/twitter"
                    style={styles.twitter}
                    icon={<FontIcon className="fi-social-twitter" color={styles.twitter.color} />}
                />
                    : null 
        }
        {
            props.oauthGitHub ?
                <SocialButton
                    label="Github"
                    href="/auth/signup/github/"
                    style={styles.github}
                    icon={<FontIcon className="fi-social-github" color={styles.github.color} />}
                />
                : null
        }
        {
            props.oauthGoogle ?
                <SocialButton
                    label="Google"
                    href="/auth/signup/google"
                    style={styles.google}
                    icon={<FontIcon className="fi-social-google-plus" color={styles.google.color} />}
                />
                    : null 
        }
        {
            props.oauthFacebook ?
                <SocialButton
                    label="Facebook"
                    href="/auth/signup/facebook"
                    style={styles.facebook}
                    icon={<FontIcon className="fi-social-facebook" color={styles.facebook.color} />}
                />
                    : null 
        }
        {
            props.oauthTumblr ?
                <SocialButton
                    label="Tumblr"
                    href="/auth/signup/tumblr"
                    style={styles.tumblr}
                    icon={<FontIcon className="fi-social-tumblr" color={styles.tumblr.color} />}
                />
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
