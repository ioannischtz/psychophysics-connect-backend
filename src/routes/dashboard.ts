// @route    api/dashboard/homepage
// @method   GET
// @desc     Get the user's (Role=Experimenter) homepage
// @access   Private: run isAuthedExperimenter Policy-Middleware

// @route    api/dashboard/experiments
// @method   GET
// @desc     Get the user's (Role=Experimenter) experiments
// @access   Private: run isAuthedExperimenter Policy-Middleware

// @route    api/dashboard/experiments/:id
// @method   GET
// @desc     Get the experiment specified by id
// @access   Private: run isAuthedExperimenter Policy-Middleware

// @route    api/dashboard/experiments
// @method   POST
// @desc     Post a new experiment
// @access   Private: run isAuthedExperimenter Policy-Middleware

// @route    api/dashboard/experiments/:id
// @method   PATCH
// @desc     Patch(update) the experiment specified by id
// @access   Private: run isAuthedExperimenter Policy-Middleware

// @route    api/dashboard/experiments/:id
// @method   DELETE
// @desc     Delete the experiment specified by id
// @access   Private: run isAuthedExperimenter Policy-Middleware

// @route    api/dashboard/experiments/:id/responses
// @method   GET
// @desc     Get the specified by id experiment's responses
// @access   Private: run isAuthedExperimenter Policy-Middleware

// @route    api/dashboard/experiments/:id/subject/:id/responses
// @method   GET
// @desc     Get the specified subject's responses for the specified experiment (by ids)
// @access   Private: run isAuthedExperimenter Policy-Middleware

// @route    api/dashboard/experiments/:id/categories
// @method   GET
// @desc     Get the experiment's specified by id categories
// @access   Private: run isAuthedExperimenter Policy-Middleware

// @route    api/dashboard/categories
// @method   GET
// @desc     Get all the categories created by the user (Role=experimenter)
// @access   Private: run isAuthedExperimenter Policy-Middleware

// @route    api/dashboard/categories
// @method   POST
// @desc     Post a new category
// @access   Private: run isAuthedExperimenter Policy-Middleware

// @route    api/dashboard/categories/:id
// @method   PATCH
// @desc     Patch(update) the specified category
// @access   Private: run isAuthedExperimenter Policy-Middleware

// @route    api/dashboard/categories/:id
// @method   DELETE
// @desc     Delete the specified by id category
// @access   Private: run isAuthedExperimenter Policy-Middleware
