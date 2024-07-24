let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    loadBooks();
    checkCurrentUser();
    document.addEventListener('DOMContentLoaded', () => {
        const header = document.querySelector('header');
    
        // Set a timeout to start the animation after a short delay
        setTimeout(() => {
            header.classList.add('animate');
        }, 10000); // 2 seconds delay before starting the animation
    });
    

    // Get the feedback form elements
    const feedbackFormContainer = document.getElementById("feedback-form-container");
    const closeFeedbackFormButton = document.getElementById("close-feedback-form");
    const feedbackFormElement = document.getElementById("feedback-form-element");

    if (feedbackFormContainer && closeFeedbackFormButton && feedbackFormElement) {
        // Show the feedback form directly if the user is on their account page
        if (currentUser) {
            feedbackFormContainer.style.display = 'block';
        }

        // Close feedback form
        closeFeedbackFormButton.addEventListener("click", () => {
            feedbackFormContainer.style.display = 'none';
        });

        // Handle feedback form submission
        feedbackFormElement.addEventListener("submit", function(event) {
            event.preventDefault(); // Prevent default form submission

            if (currentUser) {
                const bookTitle = document.getElementById("feedback-book-title").value;
                const feedbackContent = document.getElementById("feedback-content").value;

                // Validate book title
                fetch('http://localhost:3004/books')
                    .then(response => response.json())
                    .then(books => {
                        const book = books.find(b => b.bookTitle === bookTitle);
                        if (book) {
                            // Submit feedback
                            fetch('http://localhost:3004/feedbacks', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    bookTitle: bookTitle,
                                    username: currentUser.username,
                                    feedback: feedbackContent
                                })
                            })
                            .then(response => response.json())
                            .then(data => {
                                alert('Feedback submitted successfully!');
                                feedbackFormContainer.style.display = 'none';
                                feedbackFormElement.reset(); // Reset the form
                            })
                            .catch(error => {
                                console.error('Error submitting feedback:', error);
                                alert('Failed to submit feedback. Please check the console for details.');
                            });
                        } else {
                            alert('Book with the given title does not exist.');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching books:', error);
                    });
            } else {
                alert('You need to be logged in to submit feedback.');
            }
        });
    } else {
        console.error('One or more required elements are missing.');
    }

    function loadBooks() {
        fetch('http://localhost:3004/books')
            .then(response => response.json())
            .then(books => {
                const bookList = document.getElementById('book-list');
                if (bookList) {
                    bookList.innerHTML = books.map(book => `
                        <div class="book">
                            <h3>${book.bookTitle}</h3>
                            <p>${book.Author}</p>
                            <p>${book.summary}</p>
                            <p>Price: $${book.price}</p>
                            <img src="${book.coverpage}" alt="Cover Image">
                            <a href="${book.downloadLink}">Download</a>
                            <button class="purchase-button" data-book-id="${book.id}">Purchase</button>
                        </div>
                    `).join('');

                    // Add event listeners to purchase buttons
                    document.querySelectorAll('.purchase-button').forEach(button => {
                        button.addEventListener('click', handlePurchase);
                    });
                } else {
                    console.error('Book list container element not found.');
                }
            })
            .catch(error => {
                console.error('Error loading books:', error);
            });
    }

    function checkCurrentUser() {
        const accountPage = document.getElementById("account-page");
        const feedbackFormContainer = document.getElementById("feedback-form-container");
        const profileFormContainer = document.getElementById("profile-management");
        const messageFormContainer = document.getElementById("communication");
        const addBookButton = document.getElementById("add-book-button");

        if (currentUser) {
            if (accountPage) accountPage.style.display = 'block';
            if (document.getElementById("login-form")) document.getElementById("login-form").style.display = 'none';
            if (document.getElementById("register-form")) document.getElementById("register-form").style.display = 'none';

            if (feedbackFormContainer) feedbackFormContainer.style.display = 'block';
            if (profileFormContainer) profileFormContainer.style.display = 'block';
            if (messageFormContainer) messageFormContainer.style.display = 'block';

            if (addBookButton) {
                addBookButton.style.display = currentUser.role === 'author' ? 'block' : 'none';
            }
        } else {
            if (accountPage) accountPage.style.display = 'none';
            if (feedbackFormContainer) feedbackFormContainer.style.display = 'none';
            if (profileFormContainer) profileFormContainer.style.display = 'none';
            if (messageFormContainer) messageFormContainer.style.display = 'none';
        }
    }

    // Toggle login form visibility
    document.getElementById("login-button").addEventListener("click", () => {
        document.getElementById("login-form").style.display = 'flex';
        document.getElementById("register-form").style.display = 'none';
    });

    // Toggle registration form visibility
    document.getElementById("register-button").addEventListener("click", () => {
        document.getElementById("register-form").style.display = 'flex';
        document.getElementById("login-form").style.display = 'none';
    });

    document.getElementById("close-login-form").addEventListener("click", () => {
        document.getElementById("login-form").style.display = 'none';
    });

    document.getElementById("close-register-form").addEventListener("click", () => {
        document.getElementById("register-form").style.display = 'none';
    });

    document.getElementById("home-button").addEventListener("click", () => {
        location.reload(); // Reload the page
    });

    // Handle login form submission
    document.getElementById("login-form-element").addEventListener("submit", function(event) {
        event.preventDefault();
        const role = document.getElementById("login-role").value;
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;
        const userEndpoint = role === "author" ? 'authors' : 'customers';

        fetch(`http://localhost:3004/${userEndpoint}`)
            .then(response => response.json())
            .then(users => {
                const user = users.find(u => u.username === username && u.password === password);
                if (user) {
                    currentUser = user;
                    checkCurrentUser();
                    alert('Login successful!');
                    document.getElementById("login-form").style.display = 'none';
                } else {
                    alert('Invalid username or password.');
                }
            })
            .catch(error => {
                console.error('Error logging in:', error);
            });
    });

    // Toggle Add Book form visibility
    document.getElementById("add-book-button").addEventListener("click", () => {
        document.getElementById("add-book-form").style.display = 'block';
    });

    document.getElementById("close-add-book-form").addEventListener("click", () => {
        document.getElementById("add-book-form").style.display = 'none';
    });

    // Handle Add Book form submission
    document.getElementById("add-book-form-element").addEventListener("submit", function(event) {
        event.preventDefault();
        const bookTitle = document.getElementById("add-book-title").value;
        const author = document.getElementById("add-book-author").value;
        const summary = document.getElementById("add-book-summary").value;
        const price = document.getElementById("add-book-price").value;
        const coverpage = document.getElementById("add-book-coverpage").value;
        const downloadLink = document.getElementById("add-book-downloadLink").value;

        fetch('http://localhost:3004/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bookTitle: bookTitle,
                Author: author,
                summary: summary,
                price: price,
                coverpage: coverpage,
                downloadLink: downloadLink
            })
        })
        .then(response => response.json())
        .then(book => {
            alert('Book added successfully!');
            document.getElementById("add-book-form").style.display = 'none';
            loadBooks(); // Refresh the book list
        })
        .catch(error => {
            console.error('Error adding book:', error);
        });
    });

    // Handle registration form submission
    document.getElementById("register-form-element").addEventListener("submit", function(event) {
        event.preventDefault();
        const role = document.getElementById("register-role").value;
        const username = document.getElementById("register-username").value;
        const password = document.getElementById("register-password").value;
        const name = document.getElementById("register-name").value;
        const email = document.getElementById("register-email").value;
        const userEndpoint = role === "author" ? 'authors' : 'customers';

        fetch(`http://localhost:3004/${userEndpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password,
                name: name,
                email: email
            })
        })
        .then(response => response.json())
        .then(user => {
            alert('Registration successful!');
            document.getElementById("register-form").style.display = 'none';
        })
        .catch(error => {
            console.error('Error registering user:', error);
        });
    });

    function handlePurchase(event) {
        const bookId = event.target.getAttribute('data-book-id');
        // Implement purchase logic here
        alert(`Book with ID ${bookId} purchased!`);
    }
});

