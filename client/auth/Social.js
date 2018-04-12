import React from 'react'
import classNames from 'classnames'

import { FlatButton } from '../app/components/button'

const SocialButton = (props) => (
    <div>
        <FlatButton {...props} as="a" className="socialButton"/>
    </div>
)

export const SocialAuth = (props) => (
    <div>
        {
            props.oauthTwitter ?
            <SocialButton 
                style={{ color: "#55ACEE" }}
                href="/auth/signup/twitter"
                iconName="twitter"
            >TWITTER</SocialButton>
                : null 
        }
        {
            props.oauthGitHub ?
                <SocialButton 
                    style={{ color: "#4183C4" }}
                    href="/auth/signup/github"
                    iconName="github"
                >GITHUB</SocialButton>
                : null 
        }
        {
            props.oauthGoogle ?
                <SocialButton
                    style={{ color: "#DD4B39" }}
                    href="/auth/signup/google"
                    iconName="google"
                >GOOGLE</SocialButton>
                : null 
        }
        {
            props.oauthFacebook ?
                <SocialButton 
                    style={{ color: "#3B5998" }}
                    href="/auth/signup/facebook"
                    iconName="facebook"
                >FACEBOOK</SocialButton>
                : null 
        }
    </div>
)

export default SocialAuth
