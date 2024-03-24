const { Router } = require("express");
const router = Router();
const userMiddleware = require("../middleware/user");
const { User, Course } = require("../db");

// User Routes
router.post('/signup', (req, res) => {
    // Implement user signup logic
    const username = req.body.username; // get the username
    const password = req.body.password; // get the password

    // Storing in 'User' table - because creating the all the users.
    User.create({
        username: username,
        password: password
    })
        .then(function (response) {
            res.json({
                msg: "User created successfully."
            })
        })
});

router.get('/courses', async (req, res) => {
    // Implement listing all courses logic
    // This route can be seen by anyone, so middleware is not needed.
    const response = await Course.find({});

    res.json({
        Courses: response
    })

});

router.post('/courses/:courseId', userMiddleware, async (req, res) => {
    // Implement course purchase logic
    const courseId = req.params.courseId; // Getting the coursId from the url parameter
    const username = req.headers.username; // Get the username in order to push the purchased course into that user, i.e., userMiddleware is passed now.

    try {
        await User.updateOne({
            username: username
        }, {
            "$push" : {
                purchasedCourses: courseId
            }
        })
    } catch (e) {
        console.log(e);
    }
    res.json({
        message: "Purchase completed!"
    })


});

router.get('/purchasedCourses', userMiddleware, async (req, res) => {
    // Implement fetching purchased courses logic
    const user = await User.findOne({ // Finding the user using findOne method.
        username: req.headers.username // matching the username by passing it in the headers section
    });
    console.log(user.purchasedCourses);
    const courses = await Course.find({   // Now need to get the each courseIds for that particular user.
        _id:  { // _id should be similar to the database _id.
            "$in" : user.purchasedCourses
        }

    });    
    res.json({
        "Courses" : courses
    })
});

module.exports = router