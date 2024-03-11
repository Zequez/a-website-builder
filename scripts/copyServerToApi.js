import { readdirSync, statSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';

const sourceDir = './dist/ts/server';
const destinationDir = './api';

// Function to copy a file
const copyFile = (source, destination) => {
  copyFileSync(source, destination);
  console.log(`Copied ${source} to ${destination}`);
};

// Function to recursively copy a directory
const copyDirectory = (source, destination) => {
  // Read the contents of the source directory
  const files = readdirSync(source);

  // Ensure destination directory exists
  mkdirSync(destination, { recursive: true });

  // Iterate through each file
  files.forEach((file) => {
    const sourcePath = join(source, file);
    const destinationPath = join(destination, file);

    // Check if the file is a directory
    if (statSync(sourcePath).isDirectory()) {
      // Recursively copy the directory
      copyDirectory(sourcePath, destinationPath);
    } else {
      // Copy the file
      copyFile(sourcePath, destinationPath);
    }
  });
};

// Start the copying process
copyDirectory(sourceDir, destinationDir);
