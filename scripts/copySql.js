import fs from 'fs';
import path from 'path';

const sourceDir = './server/db/';
const destinationDir = './dist/ts/server/db/';

// Function to copy a file
const copyFile = (source, destination) => {
  fs.copyFileSync(source, destination);
  console.log(`Copied ${source} to ${destination}`);
};

// Function to recursively copy all .sql files from sourceDir to destinationDir
const copySqlFiles = (sourceDir, destinationDir) => {
  // Read the contents of the source directory
  fs.readdir(sourceDir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    // Iterate through each file
    files.forEach((file) => {
      const sourceFile = path.join(sourceDir, file);
      const destinationFile = path.join(destinationDir, file);

      // Check if the file is a .sql file
      if (file.endsWith('.sql')) {
        // Copy the file
        copyFile(sourceFile, destinationFile);
      } else {
        // If it's a directory, recursively copy its contents
        if (fs.statSync(sourceFile).isDirectory()) {
          const newDestinationDir = path.join(destinationDir, file);
          fs.mkdirSync(newDestinationDir, { recursive: true });
          copySqlFiles(sourceFile, newDestinationDir);
        }
      }
    });
  });
};

// Start the copying process
copySqlFiles(sourceDir, destinationDir);
