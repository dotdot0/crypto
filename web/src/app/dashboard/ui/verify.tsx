"use client";
import { pdfjs } from "react-pdf";
import { useState, useEffect } from "react";
import { RootState } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { fetchData } from "../../../redux/slices/firestoreSlice"; // Fetch data action
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/CloudUpload"; // Import upload icon

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function Verify() {
  const dispatch = useDispatch();
  const userEmail = useSelector((state: RootState) => state.auth.user?.email);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [backendResponse, setBackendResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFileData, setSelectedFileData] = useState<any>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      if (userEmail) {
        setLoading(true);
        try {
          const files = await dispatch(fetchData()).unwrap();
          setFiles(files);
        } catch (err) {
          console.error("Error fetching files:", err);
          setError("Failed to fetch files.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchFiles();
  }, [dispatch, userEmail]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const fileId = event.target.value;
    const fileData = files.find((file) => file.id === fileId);
    setSelectedFileData(fileData);
  };

  const verifyFile = async () => {
    if (selectedFileData && selectedFile) {
      const text = await extractTextFromPDF(selectedFile);
      const response = await sendPdfToBackend(
        text,
        selectedFileData.response.public_key,
        selectedFileData.response.signature
      );
      if (response) {
        setBackendResponse(
          response.result === 1
            ? "Verification successful"
            : "Verification failed"
        );
        setError(null); // Clear any previous error
      }
    } else {
      alert("Please select a PDF file and a record to verify.");
    }
  };

  const extractTextFromPDF = async (file: File) => {
    const pdf = await pdfjs.getDocument(URL.createObjectURL(file)).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      fullText += pageText + " ";
    }
    return fullText.trim();
  };

  const sendPdfToBackend = async (
    text: string,
    publicKey: string,
    signature: string
  ) => {
    try {
      const response = await fetch("http://localhost:8000/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ msg: text, public_key: publicKey, signature }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error verifying PDF with backend:", error);
      setError("Failed to get a response from the server.");
      return null;
    }
  };

  return (
    <Container sx={{ bgcolor: "black" }}>
      <Box
        display="flex"
        justifyContent="center"
        sx={{ pt: "20px" }}
        flexWrap="wrap"
        gap={4}
      >
        {/* Verify PDF Card */}
        <Card sx={{ maxWidth: 320, minWidth: 320, bgcolor: "grey.900" }}>
          <CardContent>
            <Typography variant="h5" color="white" align="center" gutterBottom>
              Verify PDF
            </Typography>
            {/* Custom file input button */}
            <input
              type="file"
              accept="application/pdf"
              id="file-upload"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              style={{ display: "none" }} // Hide the default file input
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{
                  mb: 2,
                  color: "white",
                  borderColor: "white",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }} // Change to white
              >
                Browse PDF
              </Button>
            </label>

            {/* Display the selected file name */}
            {selectedFile && (
              <Typography
                variant="body1"
                color="white"
                align="center"
                sx={{ mb: 2 }}
              >
                Selected File: {selectedFile.name}
              </Typography>
            )}

            <select
              onChange={handleFileSelect}
              style={{
                width: "100%",
                marginBottom: "16px",
                backgroundColor: "#333",
                color: "white",
                padding: "8px",
                borderRadius: "4px",
              }}
            >
              <option value="">Select a file to verify</option>
              {loading ? (
                <option disabled>Loading...</option>
              ) : (
                files.map((file) => (
                  <option key={file.id} value={file.id}>
                    {file.response.fileName || "Unnamed file"}
                  </option>
                ))
              )}
            </select>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={verifyFile}
            >
              Verify
            </Button>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {backendResponse && (
              <Alert
                severity={
                  backendResponse === "Verification successful"
                    ? "success"
                    : "error"
                }
                sx={{ mt: 2 }}
              >
                {backendResponse}
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
