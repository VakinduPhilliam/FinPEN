/* eslint-disable prettier/prettier */
async function fileUpload(formElement) {
  const formData = new FormData(formElement);
  try {
    const response = await fetch('http://localhost:6006/upload', {
      method: 'POST',
      body: formData,
      dataType: 'jsonp',
    });
    if (response.status === 200 || response.status === 201) {
      alert('Receipt processing complete!');
      window.location.href = 'http://localhost:6006/';
    } else {
      alert('Problem processing receipt!');
    }
  } catch (e) {
    console.log(e);
    alert('Receipt upload failed!');
  }
}
