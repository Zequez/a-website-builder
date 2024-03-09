import { useEffect, useState } from 'preact/hooks';
import { EditorFiles } from './types';

const BUCKETS_PREFIX = '__bucket__';

function setItem(bucketName: string, val: string) {
  localStorage.setItem(`${BUCKETS_PREFIX}${bucketName}`, val);
}

function getItem(bucketName: string) {
  return localStorage.getItem(`${BUCKETS_PREFIX}${bucketName}`);
}

function getLSBucket(bucketName: string) {
  return JSON.parse(getItem(bucketName) || '{}') as EditorFiles;
}

function setLSBucket(bucketName: string, val: EditorFiles) {
  setItem(bucketName, JSON.stringify(val));
}

function removeLSBucket(bucketName: string) {
  localStorage.removeItem(`${BUCKETS_PREFIX}${bucketName}`);
}

function getAllBuckets() {
  return Object.keys(localStorage)
    .filter((key) => key.startsWith(BUCKETS_PREFIX))
    .map((key) => key.slice(BUCKETS_PREFIX.length));
}

export function useFilesystem(initialBucket: string) {
  const [bucket, setBucket] = useState(initialBucket);

  const [files, setFiles] = useState<EditorFiles>(() => getLSBucket(bucket));

  function selectBucket(newBucket: string) {
    setBucket(newBucket);
    setFiles(getLSBucket(newBucket));
  }

  function readFile(fileName: string) {
    return files[fileName].content;
  }

  function writeFile(fileName: string, content: string) {
    const newFiles = { ...files, [fileName]: { name: fileName, content } };
    setFiles(newFiles);
    setLSBucket(bucket, newFiles);
  }

  function initialize(initFrom: EditorFiles) {
    setFiles(initFrom);
    setLSBucket(bucket, initFrom);
  }

  function renameBucket(newName: string) {
    setBucket(newName);
    setLSBucket(newName, files);
    removeLSBucket(bucket);
  }

  function deleteBucket(bucketName: string) {
    removeLSBucket(bucketName);
  }

  const bucketsNames = getAllBuckets();

  return {
    writeFile,
    readFile,
    initialize,
    files,
    selectBucket,
    bucketsNames,
    renameBucket,
    deleteBucket,
  };
}
