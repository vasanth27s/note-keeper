$(document).ready(function() {
    const apiUrl = 'http://localhost:5000/api'; // Update with your backend API URL
  
    // User authentication
    $('#btnLogin').click(function() {
      showAuthForm('login');
    });
  
    $('#btnRegister').click(function() {
      showAuthForm('register');
    });
  
    $('#btnLogout').click(function() {
      localStorage.removeItem('token');
      location.reload();
    });
  
    function showAuthForm(type) {
      $('#authSection').html(`
        <form id="authForm">
          <input type="text" id="username" placeholder="Username" required>
          <input type="password" id="password" placeholder="Password" required>
          <button type="submit">${type === 'login' ? 'Login' : 'Register'}</button>
        </form>
      `);
  
      $('#authForm').submit(function(event) {
        event.preventDefault();
        const username = $('#username').val();
        const password = $('#password').val();
        $.post(`${apiUrl}/auth/${type}`, { username, password }, function(data) {
          localStorage.setItem('token', data.token);
          location.reload();
        }).fail(function() {
          alert('Authentication failed');
        });
      });
    }
  
    const token = localStorage.getItem('token');
    if (token) {
      $('#btnLogin, #btnRegister').hide();
      $('#btnLogout').show();
      $('#authSection').hide();
      $('#notesSection').show();
      loadNotes();
    }
  
    // Notes management
    $('#btnAddNote').click(function() {
      const title = $('#noteTitle').val();
      const content = $('#noteContent').val();
      const tags = $('#noteTags').val().split(',').map(tag => tag.trim());
      $.ajax({
        url: `${apiUrl}/notes`,
        method: 'POST',
        headers: { Authorization: token },
        data: { title, content, tags },
        success: function(note) {
          addNoteToList(note);
          clearNoteForm();
        },
        error: function() {
          alert('Failed to add note');
        }
      });
    });
  
    function loadNotes() {
      $.ajax({
        url: `${apiUrl}/notes`,
        method: 'GET',
        headers: { Authorization: token },
        success: function(notes) {
          notes.forEach(note => addNoteToList(note));
        },
        error: function() {
          alert('Failed to load notes');
        }
      });
    }
  
    function addNoteToList(note) {
      $('.notes-list').append(`
        <div class="note" data-id="${note._id}">
          <h2>${note.title}</h2>
          <p>${note.content}</p>
          <p><small>Tags: ${note.tags.join(', ')}</small></p>
          <button class="btnEditNote">Edit</button>
          <button class="btnDeleteNote">Delete</button>
        </div>
      `);
    }
  
    function clearNoteForm() {
      $('#noteTitle').val('');
      $('#noteContent').val('');
      $('#noteTags').val('');
    }
  
    // Event delegation for dynamically added elements
    $(document).on('click', '.btnDeleteNote', function() {
      const noteId = $(this).closest('.note').data('id');
      $.ajax({
        url: `${apiUrl}/notes/${noteId}`,
        method: 'DELETE',
        headers: { Authorization: token },
        success: function() {
          $(`[data-id="${noteId}"]`).remove();
        },
        error: function() {
          alert('Failed to delete note');
        }
      });
    });
  
    $(document).on('click', '.btnEditNote', function() {
      const noteId = $(this).closest('.note').data('id');
      const noteElement = $(`[data-id="${noteId}"]`);
      const title = noteElement.find('h2').text();
      const content = noteElement.find('p').first().text();
      const tags = noteElement.find('small').text().replace('Tags: ', '').split(', ');
  
      $('#noteTitle').val(title);
      $('#noteContent').val(content);
      $('#noteTags').val(tags.join(', '));
  
      $('#btnAddNote').hide();
      $('#btnSaveNote').remove();
      $('.note-form').append('<button id="btnSaveNote">Save Note</button>');
  
      $('#btnSaveNote').click(function() {
        const updatedTitle = $('#noteTitle').val();
        const updatedContent = $('#noteContent').val();
        const updatedTags = $('#noteTags').val().split(',').map(tag => tag.trim());
  
        $.ajax({
          url: `${apiUrl}/notes/${noteId}`,
          method: 'PUT',
          headers: { Authorization: token },
          data: { title: updatedTitle, content: updatedContent, tags: updatedTags },
          success: function(note) {
            noteElement.find('h2').text(note.title);
            noteElement.find('p').first().text(note.content);
            noteElement.find('small').text(`Tags: ${note.tags.join(', ')}`);
            clearNoteForm();
            $('#btnSaveNote').remove();
            $('#btnAddNote').show();
          },
          error: function() {
            alert('Failed to save note');
          }
        });
      });
    });
  });
  