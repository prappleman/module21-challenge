import React from 'react';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';
import { useMutation, useQuery } from "@apollo/client";
import { QUERY_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  const token = Auth.loggedIn() ? Auth.getToken() : null;
  console.log('Token:', token);

  const { loading, data } = useQuery(QUERY_ME, { 
    context: { headers: { authorization: `Bearer ${token}`}},
  });
  const userData = data?.me || { savedBooks: [] };
  const [removeBook] = useMutation(REMOVE_BOOK);

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    console.log('Token:', token);

    if (!token) {
      console.log('No token found, unable to delete book');
      return false;
    }

    try {
      const { data } = await removeBook({
        variables: { bookId },
        context: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      });

      if (!data) {
        throw new Error('Something went wrong!');
      }
      
      removeBookId(bookId);
    } catch (err) {
      console.error('Error deleting book:', err);
    }
  };

  // if data isn't here yet, say so
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
        {userData.savedBooks && userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <CardColumns>
          {userData.savedBooks.map((book) => {
            return (
              <Card key={book.bookId} border='dark'>
                {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedBooks;