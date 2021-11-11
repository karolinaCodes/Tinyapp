<!-- screenshots- The main ( /urls ) page should be one of them -->
<!-- img file names -urls-page.png  -->

# TinyApp

TinyApp is a simple URL shortener app that takes a regular URL and transforms it into an encoded version (similar to [bit.ly](https://bitly.com/)).
Built with Node and Express for the back end, and EJS and Bootstrap for the front-end.

## Final Product

!["screenshot of URLS page"](./docs/urls_register.jpeg)
Create an account to begin creating tinyURLS! 🍾

!["screenshot of home page"](./docs/urls_index.jpeg)
Once registered or logged in, you can view your home page where all of your tinyURLS are displayed. Here, you also have the option to edit or delete them. ⚙️

!["screenshot of create new url page"](./docs/urls_new.jpeg)
Click "Create New URL" in the nav bar to be directed to the this page where you can create a new tinyURL! ✨

!["screenshot of selected url page"](./docs/urls_show.jpeg)
You can view the data for a specific tinyURL on this page which will appear after creating a new tinyURL or after clicking "edit" on a tinyURL from the home page. Here, you can also visit the webite for which you created the tinyURL URL by clicking the tinyURL link. 🔍

!["screenshot of login page"](./docs/urls_login.jpeg)
All your URLS are safe and secure in your own account. Our system ensures to keep your tinyURLS safe from any hackers. When you choose to log out of your account, you will be prompted to log back in. 🔑

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
