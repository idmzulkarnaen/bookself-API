const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading
    } = request.payload;

    if (!name) {
        const response = h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. Mohon isi nama buku',
        });
        response.code(400);
        return response;
    }

    if (readPage > pageCount) {
        const response = h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        });
        response.code(400);
        return response;
    }

    const id = nanoid(16);
    const finished = pageCount === readPage;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const newBook = {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        id,
        finished,
        insertedAt,
        updatedAt
    };
    books.push(newBook);

    const isSuccess = books.filter((book) => book.id === id).length > 0;

    if (isSuccess) {
        const response = h.response({
          status: 'success',
          message: 'Buku berhasil ditambahkan',
          data: {
            bookId: id,
          },
        });
        response.code(201);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku gagal ditambahkan',
    });
    response.code(500);
    return response;

};
/**
const getAllBooksHandler = () => ({
  status: 'success',
  data: {
    books:books.map((book)=>({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    })),
  },
});
*/

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  // Jika tidak ada query
  if (!name && !reading && !finished) {
    const response = h.response({
      status: 'success',
      data: {
        books:books.map((book)=>({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    });
    response.code(200);
    return response;
  }

  if(name){
    const filterBooksName = books.filter((book) => {
      // Jika name ada di query
      const nameUbah = new RegExp(name, 'gi');
      return nameUbah.test(book.name);
    });

    const response = h.response({
      status: 'success',
      data: {
        books:filterBooksName.map((book)=>({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    });
    response.code(200);
    return response;

  }

  if (reading) {
    // Jika ada reading query 
    const filterBooksReading = books.filter((book)=> 
    Number(book.reading) === Number(reading),
    );

    const response = h.response({
      status: 'success',
      data: {
        books:filterBooksReading.map((book)=>({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    });
    response.code(200);
    return response;
  }
  
  // Jika ada reading query 
  const filterBooksFinished = books.filter((book)=>
  Number(book.finished) === Number(finished),
  );
  const response = h.response({
    status: 'success',
    data: {
      books:filterBooksFinished.map((book)=>({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  });
  response.code(200);
  return response;  
}

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.filter((n) => n.id === bookId)[0];

  if (book !== undefined) {
    const response = h.response({
      status: 'success',
      data:{
        book,
      },
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  //Client tidak melampirkan properti name pada request body
  //tes sukses
  if (!name){    
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  //Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount
  //tes sukses
  if (readPage > pageCount){
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const updatedAt = new Date().toISOString();
  const finished = pageCount === readPage;
  const index = books.findIndex((book) => book.id === bookId);

  //error
  if(index !== -1){
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      finished,
      updatedAt
    }
    //ketika buku berhasil diperbaharui
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  // idnya yang dilampirkan oleh client tidak ditemukkan oleh server
  // tes sukses
  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1){
    books.splice(index, 1);
    // Bila id dimiliki oleh salah satu buku, maka buku tersebut harus dihapus dan server mengembalikan
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  //Bila id yang dilampirkan tidak dimiliki oleh buku manapun
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};