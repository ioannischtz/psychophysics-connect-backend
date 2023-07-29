// @route    api/experiment_sessions
// @method   GET
// @desc     Get the user's (Role=Subject) experiment_sessions
// @access   Private: run isAuthedSubject Policy-Middleware

// @route    api/experiment_sessions/:id
// @method   GET
// @desc     Get the user's (Role=Subject) experiment_session specified by id
// @access   Private: run isAuthedSubject Policy-Middleware

// @route    api/experiment_sessions/:id/single
// @method   PATCH
// @desc     Post a single response for the specified experiment_session
// @access   Private: run isAuthedSubject Policy-Middleware

// @route    api/experiment_sessions/:id
// @method   PATCH
// @desc     Post mulitple responses for the specified experiment_session
// @access   Private: run isAuthedSubject Policy-Middleware
