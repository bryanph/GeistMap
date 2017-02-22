'use strict';

export const logout = function(req, res){
  req.logout();
  res.redirect(req.app.config.appUrl);
};

export default logout
