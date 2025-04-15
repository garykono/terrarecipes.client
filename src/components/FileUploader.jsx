// Not yet implemented
import React, { useEffect, useState } from 'react';

function FileUploader({ onFileChange, handleCancel}) {
  const [image, setImage] = useState(null);

  const handleImageChange = (event) => {
    if (event.target.files) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        setImage(event.target.result);
      }

      reader.readAsDataURL(file);
      onFileChange(file);
    }
  };

//   const handleUpload = async () => {

//   };

  return (
    <div className="m-3">
      <div className="input-group">
        <input type="file" onChange={handleImageChange} />
      </div>

      {image && (
        <div className="field is-grouped m-3">
            <button onClick={handleCancel} className="button is-small">
                Cancel
            </button>
        </div>
      )}
    </div>
  );
};


export default FileUploader;