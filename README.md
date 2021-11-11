<!-- screenshots- The main ( /urls ) page should be one of them -->
<!-- img file names -urls-page.png  -->

# TinyApp

TinyApp is a simple URL shortener app that takes a regular URL and transforms it into an encoded version (similar to bit.ly).
Built with Node and Express for the back end, and EJS and Bootstrap for the front-end.

## Final Product

!["screenshot of URLS page"](./docs/urls_register.jpeg)
Create an account to begin creating tinyURLS!

!["screenshot of login page"](./docs/urls_login.jpeg)
All your URLS are safe and secure in your own account. When you choose to log out you will be prompted to log back in.
!["screenshot of home page"](./docs/urls_index.jpeg)
The home page display all of your tinyURLS with the option to edit or delete them.

!["screenshot of create new url page"](./docs/urls_new.jpeg)
Click "Create New URL" in the nav bar to be directed to the creating tinyURL page.

!["screenshot of selected url page"](./docs/urls_show.jpeg)
You can view the data for a specific url after creating it or by clicking "edit" on the home page. You can also visit the web page for the create tinyURL but clicking the tinyURL link.

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
