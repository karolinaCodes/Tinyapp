const express = require("express");
const app = express();
const PORT = 8081;
const bcrypt = require("bcryptjs");
const {urlDatabase, users} = require("./database");

// HELPER FUNCTIONS //
const {
  getUserByEmail,
  generateRandomString,
  formatURL,
  urlsForUser,
  usersUrlData,
} = require("./helpers");

// MIDDLEWARE //
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["the great barrier reef", "pebbles in the river"],

    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// VIEW ENGINE //
app.set("view engine", "ejs");

// GET REQUESTS //

// ASK FRANCIS ? - const getUserObj = (id) => users[id] -- USE RUBRIC
app.get("/", (req, res) => {
  //user is an obj
  const user = users[req.session.user_id];

  if (!user) {
    return res.redirect("/login");
  }

  res.redirect("/urls");
});

// table of urls
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];

  // user is not logged in, display error mesage
  if (!user) {
    return res.status(401).render("urls_error", {
      user: null,
      errorMsg: "Unauthorized- You must register or log in to gain access.",
    });
  }

  const usersUrls = usersUrlData(user["id"], urlDatabase);
  const templateVars = {user, urls: usersUrls};
  res.render("urls_index", templateVars);
});

// create a new url
app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];

  //if user who is not logged in tries to access /urls/new redirect to /login
  if (!user) {
    return res.redirect("/login");
  }

  const templateVars = {user};
  res.render("urls_new", templateVars);
});

// account registration
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];

  //if user is already logged in redirect to /urls (don't need access to registration form)
  if (user) {
    return res.redirect("/urls");
  }

  const templateVars = {user};
  res.render("urls_register", templateVars);
});

// account login
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];

  //if user is already logged in redirect to /urls (don't need access to login form)
  if (user) {
    return res.redirect("/urls");
  }

  const templateVars = {user};
  res.render("urls_login", templateVars);
});

//page that show the user the newly created shortURL
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];

  // display error message if user tries to access page and is not logged in
  if (!user) {
    return res.status(401).render("urls_error", {
      user: null,
      errorMsg:
        "Unauthorized Access- You must register or log in to gain access.",
    });
  }

  // if the shortURL does not exist in database, display error message
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).render("urls_error", {
      user: null,
      errorMsg: "Error- this page does not exist.",
    });
  }

  const {shortURL} = req.params;
  const {longURL} = urlDatabase[shortURL];

  // return an array of the url's the user create tinyURLs for
  const urlsForUserArray = urlsForUser(user["id"], urlDatabase);

  //if the current user does not own the tinyURL, display error message
  if (!urlsForUserArray.includes(longURL)) {
    return res.status(401).render("urls_error", {
      user: null,
      errorMsg: "Unauthorized Access- You do not have access to this page.",
    });
  }

  const templateVars = {
    shortURL,
    longURL,
    user,
  };

  res.render("urls_show", templateVars);
});

// redirect link- redirect requests to "/u/:shortURL" to its longURL(ex. http://www.google.com)
app.get("/u/:shortURL", (req, res) => {
  const {shortURL} = req.params;

  // if the :shortURL doesn't exist in data base, return error message
  if (!urlDatabase[shortURL]) {
    return res.status(404).render("urls_error", {
      user: null,
      errorMsg: "Error- that tinyURL has not been created.",
    });
  }

  const {longURL} = urlDatabase[shortURL];
  res.redirect(longURL);
});

// POST REQUESTS //

// create a new short url and send the data to the urlDatabase
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];

  // if user attempts to create a new url without being logged in, display error message
  if (!user) {
    const errorMsg = "Forbidden-You must login to perform such actions.";
    return res.status(403).render("urls_error", {user: null, errorMsg});
  }

  const shortURL = generateRandomString();
  const {longURL} = req.body;

  // if the user submits an empty input
  if (!longURL) {
    return res.status(400).render("urls_error", {
      user: null,
      errorMsg: "Error- you did not submit a valid URL.",
    });
  }

  // prepend http:// to longURL is user didn't prepend (or else introduce a bug in app when shortURL link in urls_show doesn't work)
  const formattedLongURL = formatURL(longURL);

  // save the longURL with the user ID who owns it.
  urlDatabase[shortURL] = {longURL: formattedLongURL, userID: user["id"]};

  res.redirect(`/urls/${shortURL}`);
});

//log in user if already has an account
app.post("/login", (req, res) => {
  const {email: submittedEmail} = req.body;
  const {password: submittedPassword} = req.body;

  // display error message if user did not input an email and/or password
  if (!submittedEmail || !submittedPassword) {
    let errorMsg = "";
    if (!submittedEmail) {
      errorMsg += "You did not enter your email address. ";
    }

    if (!submittedPassword) {
      errorMsg += "You did not enter a password.";
    }
    return res.status(404).render("urls_error", {user: null, errorMsg});
  }

  // if user email not in database return error message
  if (!getUserByEmail(submittedEmail, users)) {
    const errorMsg = "We cannot find your email in our system.";
    return res.status(403).render("urls_error", {user: null, errorMsg});
  }

  //if submitted email matches but the submitted password does not, return an error message
  if (
    !bcrypt.compareSync(
      submittedPassword,
      getUserByEmail(submittedEmail, users)["password"]
    )
  ) {
    const errorMsg = "Incorrect Password.";
    return res.status(403).render("urls_error", {user: null, errorMsg});
  }

  const user = getUserByEmail(submittedEmail, users);
  req.session.user_id = user["id"];
  res.redirect("/urls");
});

// "logs the user out"/ deletes the user id data in cookie
app.post("/logout", (req, res) => {
  //"destroy"/ clear the cookie
  req.session = null;
  res.redirect("/login");
});

// save user data into our users database
app.post("/register", (req, res) => {
  const {email} = req.body;
  const {password} = req.body;

  // if user did not input an email and/or password, display error message
  if (!email || !password) {
    let errorMsg = "";
    if (!email) {
      errorMsg += "You did not enter your email address. ";
    }

    if (!password) {
      errorMsg += "You did not enter a password.";
    }
    return res.status(404).render("urls_error", {user: null, errorMsg});
  }

  //create a user object
  const user = {
    id: generateRandomString(),
    email,
    password: bcrypt.hashSync(password, 10),
  };

  //display error message if the user already registered with their email
  if (getUserByEmail(user["email"], users)) {
    return res.status(404).render("urls_error", {
      user: null,
      errorMsg:
        "An account has already been created with this email. Please log in.",
    });
  }

  //add the new user to our users database
  users[user.id] = user;
  req.session.user_id = user.id;
  res.redirect("/urls");
});

// delete a tinyURL
app.post("/urls/:shortURL/delete", (req, res) => {
  // retrieve the user id in cookies to confirm whether the user owns the URL resource
  // destructure user_id and rename to userID;
  const {user_id: userID} = req.session;
  const {shortURL} = req.params;
  const {longURL} = urlDatabase[shortURL];

  //if user is not logged in, return error message
  if (!userID) {
    const errorMsg = "Forbidden- You must login to perform such actions.";
    return res.status(403).render("urls_error", {user: null, errorMsg});
  }

  // if the url does not belong to the user, display error message
  const urlsForUserArray = urlsForUser(userID, urlDatabase);
  if (!urlsForUserArray.includes(longURL)) {
    return res.status(403).render("urls_error", {
      user: null,
      errorMsg:
        "Forbidden- You do not have authorization to perform such actions.",
    });
  }

  delete urlDatabase[shortURL];

  res.redirect("/urls");
});

// update a longURL
app.post("/urls/:id", (req, res) => {
  const {user_id: userID} = req.session;
  const {id: shortURL} = req.params;
  const {longURL} = urlDatabase[shortURL];
  const {longURL: submittedURL} = req.body;

  // if user is not logged in
  if (!userID) {
    const errorMsg = "Forbidden-You must login to perform such actions.";
    return res.status(403).render("urls_error", {user: null, errorMsg});
  }

  // if user is logged it but does not own the URL for the given ID, display error message
  const urlsForUserArray = urlsForUser(userID, urlDatabase);

  if (!urlsForUserArray.includes(longURL)) {
    return res.status(403).render("urls_error", {
      user: null,
      errorMsg:
        "Forbidden- You do not have authorization to perform such actions.",
    });
  }

  urlDatabase[shortURL]["longURL"] = submittedURL;
  res.redirect(`/urls`);
});

// LISTENER //

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
