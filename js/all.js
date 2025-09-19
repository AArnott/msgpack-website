// Cache for loaded content to avoid re-fetching
var loadedQuickstarts = {};

function loadQuickstartContent(repoId, callback) {
    // Return cached content if available
    if (loadedQuickstarts[repoId]) {
        callback(loadedQuickstarts[repoId]);
        return;
    }

    // Fetch content from static JSON file
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/quickstart/' + repoId + '.json', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    var content = data.quickstart_html || '<p><em>No quickstart guide available.</em></p>';
                    loadedQuickstarts[repoId] = content;
                    callback(content);
                } catch (e) {
                    console.error('Error parsing quickstart response:', e);
                    callback('<p><em>Error loading quickstart guide.</em></p>');
                }
            } else {
                console.error('Error loading quickstart for ' + repoId + ':', xhr.status);
                callback('<p><em>Error loading quickstart guide.</em></p>');
            }
        }
    };
    xhr.send();
}

function loadQuickstartForRepo(repoId, placeholderElement) {
    var quickstartContent = placeholderElement.parentNode;
    var loading = quickstartContent.querySelector('.quickstart-loading');

    // Show loading state
    placeholderElement.style.display = 'none';
    loading.style.display = 'block';

    // Load content
    loadQuickstartContent(repoId, function(content) {
        loading.style.display = 'none';
        quickstartContent.innerHTML = content;
    });
}

function changeQuickStart(targetId, selected) {
    var holder = document.getElementById("quickstart");
    var title = document.getElementById("language");
    var target = document.getElementById(targetId);

    if(target == null) {
        return false;
    }

    /* remove all elements from the holder and title */
    var lastChild;
    while((lastChild = holder.lastChild) != null) {
        holder.removeChild(lastChild);
    }
    while((lastChild = title.lastChild) != null) {
        title.removeChild(lastChild);
    }

    var children = target.childNodes;
    var childrenLength = children.length;

    /* copy first element from target to title */
    title.appendChild(children[0].cloneNode(true));

    /* copy remaining elements from target to holder */
    for(var i=1; i < childrenLength; i++) {
        holder.appendChild(children[i].cloneNode(true));
    }

    // Load quickstart content if needed
    var quickstartContent = holder.querySelector('.quickstart-content');
    if (quickstartContent) {
        var repoId = quickstartContent.getAttribute('data-repo-id');
        var placeholder = quickstartContent.querySelector('.quickstart-placeholder');
        var loading = quickstartContent.querySelector('.quickstart-loading');

        if (placeholder && placeholder.style.display !== 'none') {
            // Show loading state
            placeholder.style.display = 'none';
            loading.style.display = 'block';

            // Load content
            loadQuickstartContent(repoId, function(content) {
                loading.style.display = 'none';
                quickstartContent.innerHTML = content;
            });
        }
    }

    /* set css */
    var selectedNodes = document.getElementsByName("selected");
    var selectedNodesLength = selectedNodes.length;
    for(var i=0; i < selectedNodesLength; i++) {
        var selectedNode = selectedNodes[i];
        selectedNode.className = "";
        selectedNode.name = "";
    }
    selected.name = "selected";
    selected.className = "selected";

    return false;
}
