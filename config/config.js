module.exports = {
    'facebookAuth' : {
        'clientID'      : '965882247126379',
        'clientSecret'  : 'c7a5ece3b3e7dc2aee291bc40f507626',
        'callbackURL'     : 'http://localhost:4000/api/auth/facebook/callback',
        'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email'

    },

    'googleAuth' : {
        'clientID'         : '163647069051-rsjk73osi31tai0rd8r1idn3rqar7l4u.apps.googleusercontent.com',
        'clientSecret'     : 'U_dzfsV2GJAKpm0WtZOmOf5t',
        'callbackURL'      : 'http://localhost:4000/auth/google/callback'
    }
};