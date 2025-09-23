-- Sample data for Library Management System
USE `library`;

-- Insert sample users (password: 'password123' hashed with Argon2)
INSERT INTO `users` (`name`, `email`, `password_hash`, `role`) VALUES
('Admin User', 'admin@library.com', '$argon2id$v=19$m=65536,t=3,p=4$YourHashedPasswordHere', 'admin'),
('John Doe', 'john.doe@example.com', '$argon2id$v=19$m=65536,t=3,p=4$YourHashedPasswordHere', 'user'),
('Jane Smith', 'jane.smith@example.com', '$argon2id$v=19$m=65536,t=3,p=4$YourHashedPasswordHere', 'user'),
('Bob Johnson', 'bob.johnson@example.com', '$argon2id$v=19$m=65536,t=3,p=4$YourHashedPasswordHere', 'user');

-- Insert sample authors
INSERT INTO `authors` (`first_name`, `last_name`, `bio`) VALUES
('J.K.', 'Rowling', 'British author best known for writing the Harry Potter fantasy series.'),
('George', 'Orwell', 'English novelist and essayist, journalist and critic.'),
('Jane', 'Austen', 'English novelist known primarily for her six major novels.'),
('Stephen', 'King', 'American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels.'),
('Agatha', 'Christie', 'English writer known for her 66 detective novels and 14 short story collections.'),
('Ernest', 'Hemingway', 'American journalist, novelist, short-story writer, and sportsman.'),
('Harper', 'Lee', 'American novelist widely known for To Kill a Mockingbird.'),
('J.R.R.', 'Tolkien', 'English writer, poet, philologist, and academic.'),
('F. Scott', 'Fitzgerald', 'American novelist, essayist, short story writer and screenwriter.'),
('Mark', 'Twain', 'American writer, humorist, entrepreneur, publisher, and lecturer.');

-- Insert sample books
INSERT INTO `books` (`title`, `year`, `isbn`, `category`, `description`, `status`) VALUES
('Harry Potter and the Philosopher\'s Stone', 1997, '978-0-7475-3269-9', 'Fantasy', 'A young wizard begins his magical education at Hogwarts School of Witchcraft and Wizardry.', 'available'),
('1984', 1949, '978-0-452-28423-4', 'Dystopian Fiction', 'A dystopian social science fiction novel about totalitarian control.', 'available'),
('Pride and Prejudice', 1813, '978-0-14-143951-8', 'Romance', 'A romantic novel of manners set in Georgian England.', 'available'),
('The Shining', 1977, '978-0-385-12167-5', 'Horror', 'A horror novel about a family isolated in a haunted hotel.', 'available'),
('Murder on the Orient Express', 1934, '978-0-00-711931-7', 'Mystery', 'A detective novel featuring Hercule Poirot.', 'available'),
('The Old Man and the Sea', 1952, '978-0-684-80122-3', 'Fiction', 'A short novel about an aging fisherman and his epic battle with a giant marlin.', 'available'),
('To Kill a Mockingbird', 1960, '978-0-06-112008-4', 'Fiction', 'A novel about racial injustice and childhood in the American South.', 'available'),
('The Hobbit', 1937, '978-0-547-92822-7', 'Fantasy', 'A children\'s fantasy novel about the journey of hobbit Bilbo Baggins.', 'available'),
('The Great Gatsby', 1925, '978-0-7432-7356-5', 'Fiction', 'A critique of the American Dream set in the Jazz Age.', 'available'),
('Adventures of Huckleberry Finn', 1884, '978-0-486-28061-5', 'Adventure', 'A novel about a boy\'s journey down the Mississippi River.', 'available'),
('Harry Potter and the Chamber of Secrets', 1998, '978-0-439-06486-6', 'Fantasy', 'The second book in the Harry Potter series.', 'borrowed'),
('Animal Farm', 1945, '978-0-452-28424-1', 'Political Satire', 'An allegorical novella about farm animals rebelling against humans.', 'reserved'),
('Sense and Sensibility', 1811, '978-0-14-143966-2', 'Romance', 'Jane Austen\'s first published novel about the Dashwood sisters.', 'available'),
('IT', 1986, '978-0-670-81302-4', 'Horror', 'A horror novel about a group of children terrorized by a supernatural entity.', 'available'),
('And Then There Were None', 1939, '978-0-00-711926-3', 'Mystery', 'A mystery novel about ten strangers trapped on an island.', 'available');

-- Link books to authors
INSERT INTO `book_authors` (`book_id`, `author_id`) VALUES
(1, 1), -- Harry Potter 1 - J.K. Rowling
(2, 2), -- 1984 - George Orwell
(3, 3), -- Pride and Prejudice - Jane Austen
(4, 4), -- The Shining - Stephen King
(5, 5), -- Murder on the Orient Express - Agatha Christie
(6, 6), -- The Old Man and the Sea - Hemingway
(7, 7), -- To Kill a Mockingbird - Harper Lee
(8, 8), -- The Hobbit - Tolkien
(9, 9), -- The Great Gatsby - F. Scott Fitzgerald
(10, 10), -- Huckleberry Finn - Mark Twain
(11, 1), -- Harry Potter 2 - J.K. Rowling
(12, 2), -- Animal Farm - George Orwell
(13, 3), -- Sense and Sensibility - Jane Austen
(14, 4), -- IT - Stephen King
(15, 5); -- And Then There Were None - Agatha Christie

-- Insert sample reservations
INSERT INTO `reservations` (`user_id`, `book_id`, `expires_at`, `status`) VALUES
(2, 12, DATE_ADD(NOW(), INTERVAL 7 DAY), 'active'),
(3, 1, DATE_ADD(NOW(), INTERVAL 5 DAY), 'active'),
(4, 8, DATE_ADD(NOW(), INTERVAL 3 DAY), 'active');

-- Insert sample loans
INSERT INTO `loans` (`user_id`, `book_id`, `admin_id`, `due_date`, `status`) VALUES
(2, 11, 1, DATE_ADD(NOW(), INTERVAL 14 DAY), 'active'),
(3, 4, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), 'overdue'),
(4, 6, 1, DATE_ADD(NOW(), INTERVAL 10 DAY), 'active');