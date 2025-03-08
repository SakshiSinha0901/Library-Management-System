// Start Loading Animation on Page Load
window.onload = function () {
    startLoading();
};

// Loading Page Logic
function startLoading() {
    let progress = 0;
    const progressBar = document.querySelector('.progress');
    const interval = setInterval(() => {
        progress += 1;
        progressBar.style.width = progress + '%';
        if (progress === 100) {
            clearInterval(interval);
            document.getElementById('loadingPage').style.display = 'none'; // Hide loading page
            document.querySelector('.login-page').style.display = 'block'; // Show login page
        }
    }, 50);
}

// Book List Data
let books = [
    { title: "The Alchemist", author: "Paulo Coelho", available: true },
    { title: "Atomic Habits", author: "James Clear", available: false },
    { title: "Clean Code", author: "Robert C. Martin", available: true },
    { title: "Deep Work", author: "Cal Newport", available: true },
    { title: "1984", author: "George Orwell", available: true },
    { title: "To Kill a Mockingbird", author: "Harper Lee", available: false }
];

// Borrowed Books Data (loaded from localStorage)
let borrowedBooks = JSON.parse(localStorage.getItem("borrowedBooks")) || [];

// User Data (loaded from localStorage)
let users = JSON.parse(localStorage.getItem("users")) || [];

// Function to save borrowed books to localStorage
function saveBorrowedBooks() {
    localStorage.setItem("borrowedBooks", JSON.stringify(borrowedBooks));
}

// Function to save users to localStorage
function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
}

// Function to display books
function displayBooks(filteredBooks = books) {
    const bookList = document.getElementById("bookList");
    if (!bookList) return;

    bookList.innerHTML = ""; // Clear existing content
    filteredBooks.forEach((book, index) => {
        const bookCard = document.createElement("div");
        bookCard.classList.add("book-card");

        bookCard.innerHTML = `
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>${book.available ? "Available" : "Not Available"}</p>
            <button ${!book.available ? "disabled" : ""} onclick="borrowBook(${index})">Borrow</button>
            <button class="edit-button" onclick="editBook(${index})">Edit</button>
            <button class="delete-button" onclick="deleteBook(${index})">Delete</button>
        `;

        bookList.appendChild(bookCard);
    });
}

// Function to handle borrowing a book
function borrowBook(index) {
    if (books[index].available) {
        const borrowerEmail = prompt("Enter your email to borrow the book:");
        if (borrowerEmail) {
            const user = users.find((user) => user.email === borrowerEmail);
            if (!user) {
                alert("User not found. Please sign up first.");
                return;
            }

            const borrowedDate = new Date().toLocaleDateString();
            const returnDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(); // 14 days from now

            borrowedBooks.push({
                title: books[index].title,
                author: books[index].author,
                borrowerEmail: borrowerEmail,
                borrowedDate: borrowedDate,
                returnDate: returnDate,
            });

            user.borrowedBooks.push(books[index].title); // Add book to user's borrowed books
            books[index].available = false; // Mark the book as borrowed
            saveUsers(); // Save updated user data
            alert(`You have borrowed "${books[index].title}"`);
            displayBooks(); // Refresh the book list
            displayBorrowedBooks(); // Refresh the borrowed books list
            saveBorrowedBooks(); // Save to localStorage
        }
    } else {
        alert("Book is not available");
    }
}

// Function to display borrowed books
function displayBorrowedBooks() {
    const borrowedBookList = document.getElementById("borrowedBookList");
    if (!borrowedBookList) return;

    borrowedBookList.innerHTML = ""; // Clear existing content
    borrowedBooks.forEach((book, index) => {
        const borrowedBookCard = document.createElement("div");
        borrowedBookCard.classList.add("borrowed-book-card");

        borrowedBookCard.innerHTML = `
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Borrowed by: ${book.borrowerEmail}</p>
            <p>Borrowed on: ${book.borrowedDate}</p>
            <p>Return by: ${book.returnDate}</p>
            <button class="delete-button" onclick="deleteBorrowedBook(${index})">Delete</button>
        `;

        borrowedBookList.appendChild(borrowedBookCard);
    });
}

// Function to edit a book
function editBook(index) {
    if (!isAdminLoggedIn) {
        alert("Only the admin can edit books.");
        return;
    }

    const newTitle = prompt("Enter new title:", books[index].title);
    const newAuthor = prompt("Enter new author:", books[index].author);
    if (newTitle && newAuthor) {
        books[index].title = newTitle;
        books[index].author = newAuthor;
        displayBooks(); // Refresh the book list
    }
}

// Function to delete a book
function deleteBook(index) {
    if (confirm("Are you sure you want to delete this book?")) {
        books.splice(index, 1);
        displayBooks(); // Refresh the book list
    }
}

// Function to delete a borrowed book
function deleteBorrowedBook(index) {
    if (confirm("Are you sure you want to delete this borrowed book record?")) {
        borrowedBooks.splice(index, 1);
        displayBorrowedBooks(); // Refresh the borrowed books list
        saveBorrowedBooks(); // Save to localStorage
    }
}

// Search Bar Functionality
document.getElementById("searchInput").addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const filteredBooks = books.filter((book) => {
        return (
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm)
        );
    });
    displayBooks(filteredBooks); // Display filtered books
});

// Show the books page after login
document.getElementById("loginFormElement").addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;

    // Find the user
    const user = users.find((user) => user.email === email);
    if (user) {
        user.loginCount += 1; // Increment login count
        saveUsers(); // Save to localStorage
    }

    alert(`Logged in with Email: ${email}`);
    document.querySelector(".login-page").style.display = "none"; // Hide login page
    document.querySelector(".books-page").style.display = "block"; // Show books page
    displayBooks(); // Display books
});

// Forgot Password Logic
document.getElementById("forgotPasswordForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("forgotEmail").value;
    alert(`Password reset instructions sent to ${email}`);
    document.querySelector(".forgot-password-page").style.display = "none"; // Hide forgot password page
    document.querySelector(".login-page").style.display = "block"; // Show login page
});

// Sign Up Logic
document.getElementById("signUpForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("signUpEmail").value;
    const password = document.getElementById("signUpPassword").value;
    const confirmPassword = document.getElementById("confirmSignUpPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return;
    }

    // Check if user already exists
    const userExists = users.some((user) => user.email === email);
    if (userExists) {
        alert("User already exists. Please log in.");
        return;
    }

    // Add new user
    users.push({
        email: email,
        loginCount: 0,
        borrowedBooks: [],
    });

    saveUsers(); // Save to localStorage
    alert(`Account created for ${email}. Please log in.`);
    document.querySelector(".sign-up-page").style.display = "none"; // Hide sign-up page
    document.querySelector(".login-page").style.display = "block"; // Show login page
});

// Back Button Functionality
document.getElementById("backToLoginFromForgot").addEventListener("click", function () {
    document.querySelector(".forgot-password-page").style.display = "none"; // Hide forgot password page
    document.querySelector(".login-page").style.display = "block"; // Show login page
});

document.getElementById("backToLoginFromNewPassword").addEventListener("click", function () {
    document.querySelector(".new-password-page").style.display = "none"; // Hide new password page
    document.querySelector(".login-page").style.display = "block"; // Show login page
});

document.getElementById("backToLoginFromSignUp").addEventListener("click", function () {
    document.querySelector(".sign-up-page").style.display = "none"; // Hide sign-up page
    document.querySelector(".login-page").style.display = "block"; // Show login page
});

// Link Navigation
document.getElementById("forgotPasswordLink").addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(".login-page").style.display = "none"; // Hide login page
    document.querySelector(".forgot-password-page").style.display = "block"; // Show forgot password page
});

document.getElementById("signUpLink").addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(".login-page").style.display = "none"; // Hide login page
    document.querySelector(".sign-up-page").style.display = "block"; // Show sign-up page
});

// Navigation Bar Links
document.getElementById("homeLink").addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(".login-page").style.display = "block"; // Show login page
    document.querySelector(".books-page").style.display = "none"; // Hide books page
    document.querySelector(".borrowed-books-page").style.display = "none"; // Hide borrowed books page
});

document.getElementById("booksLink").addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(".login-page").style.display = "none"; // Hide login page
    document.querySelector(".books-page").style.display = "block"; // Show books page
    document.querySelector(".borrowed-books-page").style.display = "none"; // Hide borrowed books page
    displayBooks(); // Display books
});

document.getElementById("borrowedBooksLink").addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(".login-page").style.display = "none"; // Hide login page
    document.querySelector(".books-page").style.display = "none"; // Hide books page
    document.querySelector(".borrowed-books-page").style.display = "block"; // Show borrowed books page
    displayBorrowedBooks(); // Display borrowed books
});

document.getElementById("loginLink").addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(".login-page").style.display = "block"; // Show login page
    document.querySelector(".books-page").style.display = "none"; // Hide books page
    document.querySelector(".borrowed-books-page").style.display = "none"; // Hide borrowed books page
});

document.getElementById("signUpLinkNav").addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(".login-page").style.display = "none"; // Hide login page
    document.querySelector(".sign-up-page").style.display = "block"; // Show sign-up page
});

// Admin Page Link
document.getElementById("adminLink").addEventListener("click", function (e) {
    e.preventDefault();
    if (!isAdminLoggedIn) {
        document.querySelector(".login-page").style.display = "none"; // Hide login page
        document.querySelector(".books-page").style.display = "none"; // Hide books page
        document.querySelector(".borrowed-books-page").style.display = "none"; // Hide borrowed books page
        document.querySelector(".admin-page").style.display = "block"; // Show admin page
        document.getElementById("adminContent").style.display = "none"; // Hide admin content
        document.getElementById("adminLoginForm").style.display = "block"; // Show admin login form
    } else {
        document.querySelector(".login-page").style.display = "none"; // Hide login page
        document.querySelector(".books-page").style.display = "none"; // Hide books page
        document.querySelector(".borrowed-books-page").style.display = "none"; // Hide borrowed books page
        document.querySelector(".admin-page").style.display = "block"; // Show admin page
        document.getElementById("adminContent").style.display = "block"; // Show admin content
        displayUsers(); // Display users
    }
});

// Admin Credentials
const ADMIN_EMAIL = "nora123jain@gmail.com";
const ADMIN_PASSWORD = "1234as";

// Track if admin is logged in
let isAdminLoggedIn = false;

// Admin Login Form Submission
document.getElementById("adminLoginFormElement").addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        document.getElementById("adminLoginForm").style.display = "none"; // Hide login form
        document.getElementById("adminContent").style.display = "block"; // Show admin content
        displayUsers(); // Display users
    } else {
        alert("Invalid admin credentials. Please try again.");
    }
});

// Function to display users in the admin page
function displayUsers() {
    const userList = document.getElementById("userList");
    if (!userList) return;

    userList.innerHTML = ""; // Clear existing content
    users.forEach((user, index) => {
        const userCard = document.createElement("div");
        userCard.classList.add("user-card");

        userCard.innerHTML = `
            <h3>${user.email}</h3>
            <p>Login Count: ${user.loginCount}</p>
            <p>Borrowed Books: ${user.borrowedBooks.length}</p>
            <button onclick="deleteUser(${index})">Delete User</button>
        `;

        userList.appendChild(userCard);
    });
}

// Function to delete a user
function deleteUser(index) {
    if (confirm("Are you sure you want to delete this user?")) {
        users.splice(index, 1);
        saveUsers(); // Save to localStorage
        displayUsers(); // Refresh the user list
    }
}