import React from 'react';

const apiURL = 'http://localhost:3001'

function AuthorForm({ author, updateAuthor, formMode, submitCallback, cancelCallback }) {

    let cancelClicked = (event) => {
        event.preventDefault();
        cancelCallback();
    }

    let renderButtons = () => {
        if (formMode === "new") {
            return (
                <button type="submit" className="btn btn-primary">Create</button>
            );
        } else {
            return (
                <div className="form-group">
                    <button type="submit" className="btn btn-primary">Save</button>
                    <button type="submit" className="btn btn-danger" onClick={cancelClicked} >Cancel</button>
                </div>
            );
        }
    }

    let formSubmitted = (event) => {
        event.preventDefault();
        submitCallback();
    };

    return (
        <div className="author-form">
            <h1> Authors </h1>
            <form onSubmit={formSubmitted}>
                <div className="form-group">
                    <label>First Name</label>
                    <input type="text" className="form-control" autoComplete='given-name' name="fname" id="fname"
                        placeholder="First Name" value={author.fname} onChange={(event) => updateAuthor('fname', event.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="lname">Last Name</label>
                    <input type="text" className="form-control" autoComplete='family-name' name="lname" id="lname"
                        placeholder="Last Name" value={author.lname} onChange={(event) => updateAuthor('lname', event.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email address</label>
                    <input type="email" className="form-control" autoComplete='email' name="email" id="email"
                        placeholder="name@example.com" value={author.email} onChange={(event) => updateAuthor('email', event.target.value)} />
                </div>
                {renderButtons()}
            </form>
        </div>
    );
}

function AuthorListItem({ author, onEditClicked, onDeleteClicked }) {
    return (
        <tr>
            <td className="col-md-3">{author.fname}</td>
            <td className="col-md-3">{author.lname}</td>
            <td className="col-md-3">{author.email}</td>
            <td className="col-md-3 btn-toolbar">
                <button className="btn btn-success btn-sm" onClick={event => onEditClicked(author)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={event => onDeleteClicked(author.id)}>
                    <i className="glyphicon glyphicon-remove"></i> Delete
          </button>
            </td>
        </tr>
    );
}

function AuthorList({ authors, onEditClicked, onDeleteClicked }) {
    console.log("The authors: ");
    console.log(authors);
    const authorItems = authors.map((author) => (
        <AuthorListItem key={author.id} author={author} onEditClicked={onEditClicked} onDeleteClicked={onDeleteClicked} />
    ));

    return (
        <div className="author-list">
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th className="col-md-3">First Name</th>
                        <th className="col-md-3">Last Name</th>
                        <th className="col-md-3">Email</th>
                        <th className="col-md-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {authorItems}
                </tbody>
            </table>
        </div>
    );
}

function Authors() {

    let [authorList, setAuthorList] = React.useState([
        { id: 0, fname: "", lname: "", email: "" }
    ]);

    let [formMode, setFormMode] = React.useState("new");

    let emptyAuthor = { fname: '', lname: '', email: '' };
    let [currentAuthor, setCurrentAuthor] = React.useState(emptyAuthor);

    let fetchAuthors = () => {
        fetch(`${apiURL}/authors`).then(response => {
            console.log("Receiving response: ");
            console.log(response);
            return response.json();
        }).then(data => {
            console.log("Response JSON: ");
            console.log(data);

            setAuthorList(data);
        });
    };

    React.useEffect(() => fetchAuthors(), []);

    let updateAuthor = (field, value) => {
        let newAuthor = { ...currentAuthor }
        newAuthor[field] = value;
        setCurrentAuthor(newAuthor);
      }

    let putAuthorUpdate = (author) => {
        const options = {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify(author)
        };
        console.log("Attempting to update author");
        console.log(author);
        console.log(options.body);
        return fetch(`${apiURL}/authors/${author.id}`, options).then(() => {
            fetchAuthors()
        });
    }

    let postNewAuthor = (author) => {
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify(author)
        };
        console.log("Attempting to post new author");
        console.log(author);
        console.log(options.body);
        return fetch(`${apiURL}/authors`, options).then(response => {
            return response.json();
        });
    }

    let formSubmitted = () => {
        if (formMode === "new") {
            postNewAuthor(currentAuthor).then(data => {
                console.log("Received data");
                console.log(data);

                if (!data.message) {
                    currentAuthor.id = data.id;
                    setAuthorList([...authorList, currentAuthor]);
                } else {
                    console.log("Error creating author: " + data.message);
                }
            });
        } else if (formMode === "update") {
            putAuthorUpdate(currentAuthor).then(data => {
                console.log("Received data");
                console.log(data);
            });
        }
        cancelClicked()
    }

    let editClicked = (author) => {
        setFormMode("update");
        setCurrentAuthor(author);
    }

    let cancelClicked = () => {
        setFormMode("new");
        setCurrentAuthor(emptyAuthor)
    }

    let deleteClicked = (id) => {
        return fetch(`${apiURL}/authors/${id}`, { method: 'DELETE' }).then(() => {
            cancelClicked()
            fetchAuthors()
        });
    }

    return (
        <div className="authors">
            <AuthorForm formMode={formMode} author={currentAuthor} updateAuthor={updateAuthor}
                submitCallback={formSubmitted} cancelCallback={cancelClicked} />
            <div />
            <AuthorList authors={authorList} onEditClicked={editClicked} onDeleteClicked={deleteClicked} />
        </div>
    );
}

export default Authors;