import React, { useEffect, useState } from "react";
import axios from "axios";
import EditPage from "./EditData";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from 'react-modal'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEye, faEdit, faTrashAlt,faTimes } from "@fortawesome/free-solid-svg-icons";

import './Fetchdata.css';

Modal.setAppElement("#root"); // Set the root element for accessibility
library.add(faEye, faEdit, faTrashAlt);

function FetchData() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedTextIds, setExpandedTextIds] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditPageOpen, setIsEditPageOpen] = useState(false);
  const [editPostData, setEditPostData] = useState(null);
  const [deletemg, setDeleteMsg] = useState();
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://jsonplaceholder.typicode.com/posts")
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, []);

  const toggleText = (postId) => {
    setExpandedTextIds((prevIds) =>
      prevIds.includes(postId)
        ? prevIds.filter((id) => id !== postId)
        : [...prevIds, postId]
    );
  };

  const handleView = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleEdit = (post) => {
    setEditPostData(post);
    setIsEditPageOpen(true);
  };

  const handleEditUpdate = (updatedPost) => {
    const updatedData = data.map((post) =>
      post.id === updatedPost.id ? updatedPost : post
    );
    setData(updatedData);
    setIsEditPageOpen(false);
  };

  const closeEditPage = () => {
    setIsEditPageOpen(false);
  };

  const handleDelete = (postId) => {
    const updatedData = data.filter((post) => post.id !== postId);
    setData(updatedData);
    setDeleteMsg("Post is deleted");
    setTimeout(() => {
      setDeleteMsg("")
    }, 6000)
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container">
      <div className="mt-3">
        <h3>Posts</h3>
        <input
          type="text"
          placeholder="Search by title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <table className="table">
          <thead>
            <tr>
              <th className="just">UserId</th>
              <th className="just">Id</th>
              <th className="just">Title</th>
              <th className='xyz'>Body</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems
              .filter(post =>
                post &&
                post.title &&
                post.body &&
                (post.title.toLowerCase().includes(searchTerm.toLowerCase()))
              )
              .map((post) => (
                <tr key={post.id}>
                  <td className="just">{post.userId}</td>
                  <td className="just">{post.id}</td>
                  <td className="just">{post.title}</td>
                  <td className="xyz">
                    {expandedTextIds.includes(post.id)
                      ? post.body
                      : post.body.slice(0, 20) + " ..."}
                    {post.body.length > 20 && (
                      <button onClick={() => toggleText(post.id)}>
                        {expandedTextIds.includes(post.id)
                          ? "View Less"
                          : "View More"}
                      </button>
                    )}
                  </td>
                  <td>
                    <button className="action-btn" onClick={() => handleView(post)}>
                      <FontAwesomeIcon icon={faEye} /> View
                    </button>
                    <button className="action-btn edit-btn" onClick={() => handleEdit(post)}>
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(post.id)}>
                      <FontAwesomeIcon icon={faTrashAlt} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {deletemg && (
          <div className="popup">
            <p>{deletemg}</p>
          </div>
        )}



         <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="View Modal"
        className="custom-modal"
         >
        <button className="close-btn" onClick={closeModal}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        {selectedPost && (
          <div>
            <h2>Details for Post ID: {selectedPost?.id}</h2>
            <table className="modal-table">
              <thead>
                <tr>
                  <th>UserId</th>
                  <th>Id</th>
                  <th>Title</th>
                  <th>Body</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="setting">{selectedPost.userId}</td>
                  <td className="setting">{selectedPost.id}</td>
                  <td className="setting">{selectedPost.title}</td>
                  <td className="setting">{selectedPost.body}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <button onClick={closeModal}>Close</button>
      </Modal>


        {isEditPageOpen && (
          <EditPage
            post={selectedPost}
            onUpdate={handleEditUpdate}
            onCancel={closeEditPage}
          />
        )}

<div>
  <ul className="pagination">
    {currentPage > 1 && (
      <li className="page-item" onClick={() => paginate(currentPage - 1)}>
        <button className="page-link">&lt; &lt;</button>
      </li>
    )}

    {Array.from({ length: Math.ceil(data.length / itemsPerPage) }, (_, i) => {
      // Show only two pagination items at a time
      if (i + 0 === currentPage || i + 1 === currentPage || i === currentPage) {
        return (
          <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
            <button onClick={() => paginate(i + 1)} className="page-link">
              {i + 1}
            </button>
          </li>
        );
      }
      return null;
    })}

    {currentPage < Math.ceil(data.length / itemsPerPage) && (
      <li className="page-item" onClick={() => paginate(currentPage + 1)}>
        <button className="page-link">&gt; &gt;</button>
      </li>
    )}
  </ul>
</div>
<label htmlFor="itemsPerPage">Items Per Page:</label>
        <input
          type="number"
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))}
          min="1"
        />

      </div>
    </div>
  );
}

export default FetchData;
