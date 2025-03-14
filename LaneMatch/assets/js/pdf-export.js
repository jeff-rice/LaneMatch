// Function to export lane assignments to PDF
function exportToPDF() {
    // Check if we have assignments to export
    const assignmentsDiv = document.getElementById('assignmentsOutput');
    if (assignmentsDiv.children.length <= 1) { // Only the date element or empty
      alert('Please generate lane assignments first before exporting.');
      return;
    }
  
    // Get configuration values
    const startLane = document.getElementById('startLane').value;
    const numLanes = document.getElementById('numLanes').value;
    const bowlersPerLane = document.getElementById('bowlersPerLane').value;
    
    // Create a script element to load jsPDF if it's not already loaded
    if (typeof jspdf === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.async = true;
      
      script.onload = function() {
        // Load additional fonts
        const fontScript = document.createElement('script');
        fontScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/polyfills.umd.js';
        fontScript.async = true;
        
        fontScript.onload = function() {
          // Now create the PDF
          generatePDF();
        };
        
        document.head.appendChild(fontScript);
      };
      
      document.head.appendChild(script);
    } else {
      // jsPDF is already loaded, create the PDF
      generatePDF();
    }
    
    function generatePDF() {
      // Create a new jsPDF instance
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set up document
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = 20;
      
      // Add title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Bowling Lane Assignments', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
      
      // Add date
      const currentDate = new Date().toLocaleDateString();
      doc.setFontSize(12);
      doc.text(`Generated on: ${currentDate}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      
      // Add configuration info
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Starting Lane: ${startLane} | Number of Lanes: ${numLanes} | Bowlers per Lane: ${bowlersPerLane}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
      
      // Add lane assignments
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Lane Assignments', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
      
      // Get all lane assignments
      const laneElements = assignmentsDiv.querySelectorAll('.lane');
      
      // Calculate layout
      const laneWidth = (pageWidth - 2 * margin) / 2; // Two columns
      let leftCol = margin;
      let rightCol = margin + laneWidth;
      
      // Loop through all lane assignments
      laneElements.forEach((laneEl, index) => {
        // Skip the date element if it exists
        if (laneEl.tagName === 'P') return;
        
        // Get the text content (clean it up by removing the icon)
        let laneText = laneEl.textContent;
        // Remove any HTML tags (in case there are icons)
        laneText = laneText.replace(/<[^>]*>/g, '');
        
        // Determine which column to place this lane info
        const xPos = index % 2 === 0 ? leftCol : rightCol;
        
        // If we're starting a new row
        if (index % 2 === 0 && index > 0) {
          yPos += 10;
        }
        
        // If we need a new page
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        // Add the lane info
        doc.setFont('helvetica', 'bold');
        doc.text(laneText.split(':')[0] + ':', xPos, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(laneText.split(':')[1], xPos + 20, yPos);
      });
      
      // Footer with J.Rice Coaching branding
      const footerYPos = doc.internal.pageSize.getHeight() - 10;
      doc.setFontSize(8);
      doc.setTextColor(0, 83, 156); // Primary blue
      doc.text('Generated by J.Rice Coaching Lane Assignment Tool', pageWidth / 2, footerYPos, { align: 'center' });
      
      // Save the PDF
      doc.save('bowling-lane-assignments.pdf');
    }
  }
  
  // Add export button to the page
  function addExportButton() {
    // Find the button group
    const buttonGroup = document.querySelector('.button-group');
    
    // Create the export button
    const exportButton = document.createElement('button');
    exportButton.innerHTML = '<i class="fas fa-file-pdf"></i> Export to PDF';
    exportButton.classList.add('export-btn');
    exportButton.style.backgroundColor = '#00539C'; // Primary blue
    
    // Add click event listener
    exportButton.addEventListener('click', exportToPDF);
    
    // Add to button group
    buttonGroup.appendChild(exportButton);
  }
  
  // Initialize export button when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Add the PDF export button
    addExportButton();
  });