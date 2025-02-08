const getUserFromSession = async (req, res, next) => {
    if (!req.session.user_id) {
      return res.redirect("/"); // Redirect if no user is logged in
    }
  
    try {
      const user = await User.findById(req.session.user_id);
      req.user = user; // Add user to request object
      next(); // Proceed to the next middleware or route handler
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  };
  