const express = require("express");
const app = express();
const PORT = 8080;

// MIDDLEWARE //
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// VIEW ENGINE //
app.set("view engine", "ejs");

// DATABASE //

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// HELPER FUNCTIONS //

// generate a random 6 character alphanumeric string which will become the "unique" shortURL
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

const emailLookup = email => {
  //loop through users object to see if a user's email already exists in our database
  // return the user if there a match (truthy), otherwise returns undefined (falsey)
  for (let user of Object.keys(users)) {
    if (users[user]["email"] === email) {
      return users[user];
    }
  }

  return;
};

// GET REQUESTS //

// table of urls
app.get("/urls", (req, res) => {
  //user is an obj
  const user = users[req.cookies["user_id"]];

  const templateVars = {user, urls: urlDatabase};
  res.render("urls_index", templateVars);
});

// create a new url
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {user};
  res.render("urls_new", templateVars);
});

// account registration
app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];

  //if user is already logged in redirect to /urls (don't need access to registration form)
  if (user) {
    return res.redirect("/urls");
  }

  const templateVars = {user};
  res.render("urls_register", templateVars);
});

// account login
app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];

  //if user is already logged in redirect to /urls (don't need access to login form)
  if (user) {
    return res.redirect("/urls");
  }

  const templateVars = {user};
  res.render("urls_login", templateVars);
});

//page that show the user the newly created shortURL
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]["longURL"];

  const templateVars = {
    shortURL,
    longURL,
    user,
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// POST REQUESTS //

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = longURL;

  //what if user already create a short url for a url?
  res.redirect(`/urls/${shortURL}`);
});

//log in user if already has an account
app.post("/login", (req, res) => {
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;

  // display error message if user did not input an email and/or password
  if (!submittedEmail || !submittedPassword) {
    let errorMsg = "";
    if (!submittedEmail) {
      errorMsg += "You did not enter your email address. ";
    }

    if (!submittedPassword) {
      errorMsg += "You did not enter a password.";
    }
    return res.status(404).render("urls_error", {user: undefined, errorMsg});
  }

  // if user email not in database return error message
  if (!emailLookup(submittedEmail)) {
    const errorMsg = "We cannot find your email in our system.";
    return res.status(403).render("urls_error", {user: undefined, errorMsg});
  }

  //if submitted email matches but the submitted password does not, return an error message
  if (emailLookup(submittedEmail)["password"] !== submittedPassword) {
    const errorMsg = "Incorrect Password.";
    return res.status(403).render("urls_error", {user: undefined, errorMsg});
  }

  const user = emailLookup(submittedEmail);
  res.cookie("user_id", user["id"]);
  res.redirect("/urls");
});

// "logs the user out"/ deletes the user id data in cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// add the user info to our users database
app.post("/register", (req, res) => {
  //create a user object
  const user = {
    id: generateRandomString(),
    email: req.body.email,
    password: req.body.password,
  };

  //display error message if user did not input an email and/or password
  if (!user["email"] || !user["password"]) {
    let errorMsg = "";
    if (!user["email"]) {
      errorMsg += "You did not enter your email address. ";
    }

    if (!user["password"]) {
      errorMsg += "You did not enter a password.";
    }
    return res.status(404).render("urls_error", {user, errorMsg});
  }

  //display error message if the user already registered with their email
  if (emailLookup(user["email"])) {
    return res.status(404).render("urls_error", {
      user: undefined,
      errorMsg:
        "An account has already been created with this email. Please log in.",
    });
  }

  //add the new user to our users database
  users[user.id] = user;

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

// delete the URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  //after it deletes the url, it redirects to the current page- the index page so you can see the new state of the page
  res.redirect("/urls");
});

//update a resource
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL]["longURL"] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// LISTENER //

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
