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
    .map((key) => key.slice(BUCKETS_PREFIX.length))
    .sort((a, b) => a.localeCompare(b));
}

function generateRandomAlphaNumericString() {
  return Math.random().toString(36).slice(2);
}

export function useFilesystem() {
  const bucketsNames = getAllBuckets();

  const [bucket, setBucket] = useState(() => bucketsNames[0] || generateRandomAlphaNumericString());

  const [files, setFiles] = useState<EditorFiles>(() => getLSBucket(bucket));

  function createBucket() {
    const newBucket = generateRandomAlphaNumericString();
    setBucket(newBucket);
    setLSBucket(newBucket, {});
    setFiles({});
  }

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
    if (newName !== bucket) {
      setBucket(newName);
      setLSBucket(newName, files);
      removeLSBucket(bucket);
    }
  }

  function deleteBucket(bucketName: string) {
    if (bucketsNames.length > 1) {
      removeLSBucket(bucketName);
      if (bucketName === bucket) {
        const filteredBucketsNames = bucketsNames.filter((bn) => bn !== bucketName);
        const nextBucket = filteredBucketsNames[0];
        selectBucket(nextBucket);
      }
    }
  }

  return {
    bucket,
    writeFile,
    readFile,
    initialize,
    files,
    selectBucket,
    bucketsNames,
    renameBucket,
    deleteBucket,
    createBucket,
  };
}
