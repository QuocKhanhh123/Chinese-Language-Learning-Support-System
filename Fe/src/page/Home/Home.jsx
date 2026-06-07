"use client";

import React, { useState } from "react";
import {
  Container,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Rating,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import HeadsetIcon from "@mui/icons-material/Headset";
import MicIcon from "@mui/icons-material/Mic";
import TranslateIcon from "@mui/icons-material/Translate";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import BarChartIcon from "@mui/icons-material/BarChart";
import PsychologyIcon from "@mui/icons-material/Psychology";
import GroupIcon from "@mui/icons-material/Group";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SchoolIcon from "@mui/icons-material/School";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import ClassIcon from "@mui/icons-material/Class";
import StarIcon from "@mui/icons-material/Star";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { useNavigate } from "react-router-dom";

// Import images
import bannerChineseLearning from "../../assets/banner-chinese-learning.jpg";
import calligraphyArt from "../../assets/calligraphy-art.jpg";
import chineseCulture from "../../assets/chinese-culture.jpg";
import conversationPractice from "../../assets/conversation-practice.jpg";

export default function ChinesePracticeUI() {
  const navigate = useNavigate();


  const brand = {
    // Primary - Chinese Crimson
    primary: "#B91C1C",
    primaryDark: "#7F1D1D",
    primaryLight: "#DC2626",
    primary50: "#FEF2F2",
    primary100: "#FEE2E2",

    // Secondary - Charcoal Navy
    secondary: "#1E293B",
    secondaryLight: "#334155",

    // Accent - Antique Gold
    accent: "#D97706",
    accentLight: "#F59E0B",

    // Neutrals
    bgSoft: "#FAFAF9",
    bgCard: "#FFFFFF",
    muted: "#78716C",
    textPrimary: "#1C1917",
    textSecondary: "#57534E",

    // Semantic
    success: "#059669",
    warning: "#D97706",
    info: "#0284C7",
  };

  const practices = [
    {
      icon: MenuBookIcon,
      title: "Học Từ Vựng",
      description: "Học từ vựng tinh lọc theo chủ đề và trình độ",
      color: brand.primary,
    },
    {
      icon: VolumeUpIcon,
      title: "Nhập Bằng Pinyín",
      description: "Nắm vững pinyín, tự động nhận dạng thanh điệu",
      color: brand.success,
    },
    {
      icon: HeadsetIcon,
      title: "Luyện Nghe",
      description: "Thích ứng với các giọng nói và tốc độ khác nhau",
      color: brand.secondary,
    },
    {
      icon: MicIcon,
      title: "Luyện Nói",
      description: "Phản hồi thời gian thực và hướng dẫn phát âm",
      color: brand.primaryDark,
    },
    {
      icon: TranslateIcon,
      title: "Trò Chơi Dịch",
      description: "Dịch nhanh Tiếng Trung ↔ Tiếng Việt",
      color: brand.accent,
    },
    {
      icon: BookmarkIcon,
      title: "Thẻ Ghi Nhớ",
      description: "Hệ thống lặp lại theo khoảng thời gian thông minh",
      color: brand.info,
    },
  ];

  const levels = [
    { level: "HSK 1", words: "150 từ", lessons: "10 bài", courseLink: "/courses" },
    { level: "HSK 2", words: "300 từ", lessons: "20 bài", courseLink: "/courses" },
    { level: "HSK 3", words: "600 từ", lessons: "30 bài", courseLink: "/courses" },
    { level: "HSK 4", words: "1200 từ", lessons: "40 bài", courseLink: "/courses" },
    { level: "HSK 5", words: "2500 từ", lessons: "50 bài", courseLink: "/courses" },
    { level: "HSK 6", words: "5000 từ", lessons: "60 bài", courseLink: "/courses" },
  ];

  const features = [
    {
      icon: FlashOnIcon,
      title: "Học Tập Thông Minh",
      description: "Con đường học tập được cá nhân hóa bằng AI",
      color: brand.accent,
    },
    {
      icon: BarChartIcon,
      title: "Trực Quan Hóa Dữ Liệu",
      description: "Theo dõi tiến độ bằng biểu đồ và báo cáo",
      color: brand.success,
    },
    {
      icon: PsychologyIcon,
      title: "Tăng Cường Trí Nhớ",
      description: "Hệ thống lặp lại theo khoa học giúp ghi nhớ lâu",
      color: brand.primary,
    },
    {
      icon: GroupIcon,
      title: "Tương Tác Cộng Đồng",
      description: "Giao lưu, chia sẻ với người học toàn cầu",
      color: brand.info,
    },
  ];

  const testimonials = [
    {
      name: "Nguyễn Văn An",
      role: "Sinh viên Đại học",
      content: "Chỉ sau 3 tháng học với C-learning, tôi đã tự tin vượt qua kì thi HSK 3 với số điểm cao! Phương pháp học rất khoa học.",
      rating: 5,
      avatar: "A",
    },
    {
      name: "Maria Garcia",
      role: "Giáo viên tiếng Anh",
      content: "Tính năng luyện nghe và phát âm rất hữu ích. Tôi có thể luyện tập mọi lúc mọi nơi với ứng dụng này.",
      rating: 5,
      avatar: "M",
    },
    {
      name: "Trần Thị Hoa",
      role: "Nhân viên văn phòng",
      content: "Chỉ 15 phút mỗi ngày là đủ để tiến bộ rõ rệt. Hệ thống nhắc nhở và theo dõi tiến độ rất tuyệt vời!",
      rating: 5,
      avatar: "H",
    },
  ];

  // Learning path data
  const learningPath = [
    {
      step: "01",
      title: "Đánh giá trình độ",
      description: "Làm bài test để xác định trình độ hiện tại và nhận lộ trình phù hợp",
      icon: AssignmentIcon,
      color: brand.primary,
    },
    {
      step: "02",
      title: "Học theo lộ trình",
      description: "Học từ vựng, ngữ pháp theo chương trình chuẩn HSK được cá nhân hóa",
      icon: AutoStoriesIcon,
      color: brand.accent,
    },
    {
      step: "03",
      title: "Luyện tập hàng ngày",
      description: "Thực hành nghe, nói, đọc, viết với các bài tập tương tác",
      icon: TrackChangesIcon,
      color: brand.success,
    },
    {
      step: "04",
      title: "Thi thử & Đạt chứng chỉ",
      description: "Làm đề thi thử và sẵn sàng chinh phục kỳ thi HSK thực tế",
      icon: EmojiEventsIcon,
      color: brand.warning,
    },
  ];

  // Popular courses data
  const popularCourses = [
    {
      title: "Luyện Từ Vựng HSK",
      students: "2,500+",
      lessons: "10,000+ từ vựng",
      duration: "Flashcard thông minh",
      icon: LibraryBooksIcon,
      level: "Tất cả cấp độ",
      bgGradient: "linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)",
      description: "Học từ vựng theo chủ đề với hệ thống lặp lại thông minh",
    },
    {
      title: "Luyện Nghe Tiếng Trung",
      students: "1,800+",
      lessons: "50+ bài luyện",
      duration: "Đa dạng giọng nói",
      icon: HeadsetIcon,
      level: "HSK 1-6",
      bgGradient: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
      description: "Rèn luyện kỹ năng nghe với các bài tập tương tác",
    },
    {
      title: "Thi Thử HSK Online",
      students: "950+",
      lessons: "Đề thi chuẩn",
      duration: "Chấm điểm tự động",
      icon: WorkspacePremiumIcon,
      level: "HSK 1-6",
      bgGradient: "linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)",
      description: "Làm đề thi thử với format giống kỳ thi thực tế",
    },
  ];

  // FAQ data
  const faqs = [
    {
      question: "C-learning phù hợp với đối tượng nào?",
      answer: "C-learning phù hợp với tất cả mọi người từ người mới bắt đầu đến người muốn nâng cao trình độ, từ học sinh, sinh viên đến người đi làm.",
    },
    {
      question: "Tôi cần bao lâu để đạt HSK 3?",
      answer: "Với việc học đều đặn 30 phút/ngày, bạn có thể đạt HSK 3 trong khoảng 6-9 tháng tùy theo nền tảng và khả năng tiếp thu.",
    },
    {
      question: "Có hỗ trợ giáo viên trực tiếp không?",
      answer: "Có, chúng tôi có đội ngũ giáo viên bản ngữ và Việt Nam sẵn sàng hỗ trợ qua các buổi học trực tuyến và chat hỗ trợ.",
    },
    {
      question: "Phương thức thanh toán như thế nào?",
      answer: "Chúng tôi hỗ trợ thanh toán qua thẻ ngân hàng, ví điện tử (Momo, ZaloPay), và chuyển khoản ngân hàng.",
    },
  ];

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", bgcolor: brand.bgSoft, pb: 0 }}
    >
      {/* HERO */}
      <Box
        sx={{
          py: { xs: 8, md: 14 },
          background: `linear-gradient(135deg, ${brand.primary50} 0%, #FFFFFF 50%, ${brand.primary50} 100%)`,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: "50%",
            height: "100%",
            backgroundImage: `url(${bannerChineseLearning})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.25,
            maskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
          },
        }}
      >
        <Container sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center", maxWidth: 900, mx: "auto" }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
                px: 3,
                py: 0.75,
                borderRadius: 3,
                bgcolor: brand.primary100,
                color: brand.primary,
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: "0.5px",
                border: `1px solid ${brand.primary}20`,
              }}
            >
              <StarIcon sx={{ fontSize: 16 }} />
              Nền Tảng Luyện Tập HSK Hàng Đầu
            </Box>

            <Typography
              component="h1"
              variant="h3"
              sx={{
                fontWeight: 800,
                mt: 2,
                mb: 2,
                lineHeight: 1.3,
                color: brand.textPrimary,
                fontFamily: "'Be Vietnam Pro', sans-serif",
              }}
            >
              Nắm Vững{" "}
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%)`,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Kiến Thức Tiếng Trung
              </Box>
              , Vượt Qua Kì Thi HSK Dễ Dàng
            </Typography>

            <Typography sx={{ color: brand.muted, fontSize: 17, mb: 4, maxWidth: 600, mx: "auto" }}>
              Học tập có hệ thống, ôn tập thông minh, nhận phản hồi thực tế -
              hành trình học tiếng Trung của bạn không còn cô đơn.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
              sx={{ mb: 5 }}
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  bgcolor: brand.primary,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 15,
                  boxShadow: `0 4px 14px 0 ${brand.primary}40`,
                  "&:hover": {
                    bgcolor: brand.primaryDark,
                    boxShadow: `0 6px 20px 0 ${brand.primary}50`,
                  },
                }}
                onClick={() => navigate("/practice")}
              >
                Bắt Đầu Luyện Tập Ngay
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderColor: brand.primary,
                  color: brand.primary,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 15,
                  borderWidth: 2,
                  "&:hover": {
                    borderWidth: 2,
                    bgcolor: brand.primary50,
                    borderColor: brand.primaryDark,
                  },
                }}
              >
                Tìm Hiểu Thêm
              </Button>
            </Stack>

            <Grid container spacing={3} sx={{ mt: 4 }} justifyContent="center">
              <Grid item xs={4} sm={3} md={2}>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: brand.primary }}
                  >
                    10K+
                  </Typography>
                  <Typography sx={{ color: brand.muted, fontSize: 12, fontWeight: 500 }}>
                    Từ Vựng Tinh Lọc
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4} sm={3} md={2}>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: brand.accent }}
                  >
                    50+
                  </Typography>
                  <Typography sx={{ color: brand.muted, fontSize: 12, fontWeight: 500 }}>
                    Bài Luyện Tập
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4} sm={3} md={2}>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: brand.success }}
                  >
                    95%
                  </Typography>
                  <Typography sx={{ color: brand.muted, fontSize: 12, fontWeight: 500 }}>
                    Tỷ Lệ Vượt Qua
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* PRACTICES */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", maxWidth: 720, mx: "auto", mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: brand.textPrimary,
                mb: 1.5,
                fontFamily: "'Be Vietnam Pro', sans-serif",
              }}
            >
              Trải Nghiệm Luyện Tập{" "}
              <Box component="span" sx={{ color: brand.primary }}>Đa Chiều</Box>
            </Typography>
            <Typography sx={{ color: brand.muted, fontSize: 16, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              6 chuyên đề nâng cao toàn diện trình độ tiếng Trung của bạn
            </Typography>
          </Box>

          <Grid container spacing={3} justifyContent="center">
            {practices.map((p, idx) => {
              const Icon = p.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={idx} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Card
                    elevation={0}
                    sx={{
                      width: '100%',
                      maxWidth: 360,
                      height: "100%",
                      display: "flex",
                      alignItems: "stretch",
                      transition: "all 0.3s ease",
                      border: "1px solid",
                      borderColor: "rgba(0,0,0,0.06)",
                      borderRadius: 3,
                      bgcolor: brand.bgCard,
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 12px 24px -10px rgba(0,0,0,0.15)",
                        borderColor: `${p.color}30`,
                      },
                    }}
                  >
                    <CardContent
                      sx={{ display: "flex", gap: 2.5, alignItems: "center", p: 3 }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: `${p.color}15`,
                          width: 60,
                          height: 60,
                          border: `2px solid ${p.color}25`,
                        }}
                      >
                        <Icon sx={{ color: p.color, fontSize: 28 }} />
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: brand.textPrimary, mb: 0.5 }}>
                          {p.title}
                        </Typography>
                        <Typography sx={{ color: brand.muted, fontSize: 14, lineHeight: 1.5 }}>
                          {p.description}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* LEVELS */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: brand.bgCard }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", maxWidth: 720, mx: "auto", mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: brand.textPrimary,
                mb: 1.5,
                fontFamily: "'Be Vietnam Pro', sans-serif",
              }}
            >
              6 Cấp Độ{" "}
              <Box component="span" sx={{ color: brand.primary }}>HSK</Box>
            </Typography>
            <Typography sx={{ color: brand.muted, fontSize: 16, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Hành trình học tập hoàn chỉnh từ sơ cấp đến thành thạo
            </Typography>
          </Box>

          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2.5,
            flexWrap: 'nowrap',
            width: '100%',
          }}>
            {levels.map((lvl, i) => (
              <Card
                key={i}
                elevation={0}
                sx={{
                  flex: '1 1 0',
                  minWidth: 0,
                  maxWidth: 180,
                  minHeight: 300,
                  display: "flex",
                  flexDirection: "column",
                  border: "2px solid",
                  borderColor: "rgba(0,0,0,0.06)",
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  overflow: "hidden",
                  bgcolor: "#fff",
                  "&:hover": {
                    boxShadow: "0 12px 24px -8px rgba(185, 28, 28, 0.25)",
                    borderColor: `${brand.primary}50`,
                    transform: "translateY(-4px)",
                    "& .level-badge": {
                      bgcolor: brand.primary,
                      color: "#fff",
                    },
                  },
                }}
              >
                {/* Header với gradient */}
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${brand.primary}15 0%, ${brand.primary}08 100%)`,
                    py: 3.5,
                    px: 1.5,
                    textAlign: "center",
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <Box
                    className="level-badge"
                    sx={{
                      display: "inline-block",
                      px: 2.5,
                      py: 1.25,
                      borderRadius: 2,
                      bgcolor: brand.primary50,
                      color: brand.primary,
                      fontWeight: 800,
                      fontSize: 18,
                      transition: "all 0.3s ease",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {lvl.level}
                  </Box>
                </Box>

                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 }, display: "flex", flexDirection: "column", flexGrow: 1, textAlign: "center" }}>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography sx={{ color: brand.textSecondary, mb: 1, fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75 }}>
                      <MenuBookIcon sx={{ fontSize: 20, color: brand.primary }} /> {lvl.words}
                    </Typography>
                    <Typography sx={{ color: brand.muted, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75 }}>
                      <SchoolIcon sx={{ fontSize: 20, color: brand.accent }} /> {lvl.lessons}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: "auto",
                      bgcolor: brand.primary,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      py: 1.25,
                      fontSize: 14,
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: brand.primaryDark,
                        boxShadow: "0 4px 12px rgba(185, 28, 28, 0.3)",
                      },
                    }}
                    onClick={() => navigate(lvl.courseLink)}
                  >
                    Chọn Cấp Độ
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* FEATURES & TESTIMONIALS */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: brand.bgSoft }}>
        <Container maxWidth="lg">
          {/* Section Header */}
          <Box sx={{ textAlign: "center", maxWidth: 720, mx: "auto", mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: brand.textPrimary,
                mb: 1.5,
                fontFamily: "'Be Vietnam Pro', sans-serif",
              }}
            >
              Tại Sao Chọn{" "}
              <Box component="span" sx={{ color: brand.primary }}>Chúng Tôi</Box>?
            </Typography>
            <Typography sx={{ color: brand.muted, fontSize: 16, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Cung cấp trải nghiệm học tiếng Trung tốt nhất với phương pháp hiện đại
            </Typography>
          </Box>

          {/* Features Grid - Centered */}
          <Grid container spacing={2} justifyContent="center" sx={{ mb: 8 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Grid item xs={6} sm={6} md={3} lg={3} key={i} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Card
                    elevation={0}
                    sx={{
                      width: '100%',
                      maxWidth: 260,
                      textAlign: 'center',
                      p: 2.5,
                      border: "1px solid",
                      borderColor: "rgba(0,0,0,0.06)",
                      borderRadius: 3,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: `${f.color}30`,
                        boxShadow: "0 8px 16px -8px rgba(0,0,0,0.1)",
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: `${f.color}12`,
                        width: 56,
                        height: 56,
                        border: `2px solid ${f.color}20`,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <Icon sx={{ color: f.color, fontSize: 26 }} />
                    </Avatar>
                    <Typography sx={{ fontWeight: 700, color: brand.textPrimary, mb: 0.5, fontSize: 15, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                      {f.title}
                    </Typography>
                    <Typography sx={{ color: brand.muted, fontSize: 13, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                      {f.description}
                    </Typography>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Testimonials Section */}
          <Box sx={{ textAlign: "center", maxWidth: 720, mx: "auto", mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: brand.textPrimary,
                mb: 1.5,
                fontFamily: "'Be Vietnam Pro', sans-serif",
              }}
            >
              Đánh Giá Của{" "}
              <Box component="span" sx={{ color: brand.accent }}>Học Viên</Box>
            </Typography>
            <Typography sx={{ color: brand.muted, fontSize: 16, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Những phản hồi chân thực từ cộng đồng học viên
            </Typography>
          </Box>

          <Grid container spacing={3} justifyContent="center">
            {testimonials.map((t, i) => (
              <Grid item xs={12} sm={6} md={4} key={i} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card
                  elevation={0}
                  sx={{
                    width: '100%',
                    maxWidth: 360,
                    p: 3,
                    border: "1px solid",
                    borderColor: "rgba(0,0,0,0.06)",
                    borderRadius: 3,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: `${brand.accent}30`,
                      boxShadow: "0 8px 16px -8px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box>
                    <Rating
                      value={t.rating}
                      readOnly
                      size="small"
                      sx={{
                        "& .MuiRating-iconFilled": {
                          color: brand.accent,
                        },
                      }}
                    />
                    <Typography
                      sx={{
                        fontStyle: "italic",
                        mt: 1.5,
                        mb: 2,
                        color: brand.textSecondary,
                        fontSize: 15,
                        lineHeight: 1.6,
                        fontFamily: "'Be Vietnam Pro', sans-serif",
                      }}
                    >
                      "{t.content}"
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: brand.primary,
                          width: 36,
                          height: 36,
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {t.avatar || t.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: brand.textPrimary, fontSize: 14, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                          {t.name}
                        </Typography>
                        <Typography sx={{ color: brand.muted, fontSize: 12, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                          {t.role}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* LEARNING PATH SECTION */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: brand.bgCard,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative image */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "40%",
            height: "100%",
            backgroundImage: `url(${calligraphyArt})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.12,
            maskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center", maxWidth: 720, mx: "auto", mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: brand.textPrimary,
                mb: 1.5,
                fontFamily: "'Be Vietnam Pro', sans-serif",
              }}
            >
              Lộ Trình Học{" "}
              <Box component="span" sx={{ color: brand.primary }}>4 Bước</Box>
            </Typography>
            <Typography sx={{ color: brand.muted, fontSize: 16, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Quy trình học tập khoa học giúp bạn tiến bộ nhanh chóng
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {learningPath.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Grid item xs={12} sm={6} md={3} key={idx} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box
                    sx={{
                      textAlign: "center",
                      width: '100%',
                      maxWidth: 260,
                      position: "relative",
                      "&::after": idx < 3 ? {
                        content: '""',
                        position: "absolute",
                        top: "60px",
                        right: { xs: "50%", md: "-15%" },
                        width: { xs: "2px", md: "30%" },
                        height: { xs: "40px", md: "3px" },
                        background: `linear-gradient(90deg, ${brand.primary}40, ${brand.primary}10)`,
                        display: { xs: "none", md: "block" },
                      } : {},
                    }}
                  >
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        bgcolor: `${item.color}10`,
                        border: `3px solid ${item.color}25`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 3,
                        position: "relative",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: `0 12px 24px -8px ${item.color}30`,
                        },
                      }}
                    >
                      <Icon sx={{ fontSize: 48, color: item.color }} />
                      <Box
                        sx={{
                          position: "absolute",
                          top: -4,
                          right: -4,
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          bgcolor: item.color,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          boxShadow: `0 4px 12px ${item.color}40`,
                        }}
                      >
                        {item.step}
                      </Box>
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: brand.textPrimary, mb: 1, fontSize: 17 }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: brand.muted, fontSize: 14, lineHeight: 1.6, px: 2 }}>
                      {item.description}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* POPULAR COURSES SECTION */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: brand.bgSoft,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative image */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "35%",
            height: "100%",
            backgroundImage: `url(${conversationPractice})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.10,
            maskImage: "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center", maxWidth: 720, mx: "auto", mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: brand.textPrimary,
                mb: 1.5,
                fontFamily: "'Be Vietnam Pro', sans-serif",
              }}
            >
              Chuyên Mục{" "}
              <Box component="span" sx={{ color: brand.primary }}>Luyện Tập</Box>
            </Typography>
            <Typography sx={{ color: brand.muted, fontSize: 16, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Các tính năng luyện tập được yêu thích nhất tại C-learning
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {popularCourses.map((course, idx) => {
              const CourseIcon = course.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={idx} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Card
                    elevation={0}
                    sx={{
                      width: '100%',
                      maxWidth: 360,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      border: "1px solid",
                      borderColor: "rgba(0,0,0,0.06)",
                      borderRadius: 4,
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 16px 32px -12px rgba(0,0,0,0.15)",
                        transform: "translateY(-8px)",
                      },
                    }}
                  >
                    {/* Course Image Header */}
                    <Box
                      sx={{
                        height: 180,
                        background: course.bgGradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          bgcolor: "rgba(255,255,255,0.9)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                        }}
                      >
                        <CourseIcon sx={{ fontSize: 40, color: brand.primary }} />
                      </Box>
                      <Chip
                        label={course.level}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 16,
                          right: 16,
                          bgcolor: brand.primary,
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      />
                    </Box>

                    <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 700, color: brand.textPrimary, fontSize: 18, mb: 1 }}>
                        {course.title}
                      </Typography>

                      <Typography sx={{ color: brand.muted, fontSize: 13, mb: 2, lineHeight: 1.5, minHeight: 40 }}>
                        {course.description}
                      </Typography>

                      <Stack spacing={1.5} sx={{ mb: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: brand.muted, fontSize: 14 }}>
                          <PeopleIcon sx={{ fontSize: 18, color: brand.primary }} />
                          <span>{course.students} học viên</span>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: brand.muted, fontSize: 14 }}>
                          <SchoolIcon sx={{ fontSize: 18, color: brand.accent }} />
                          <span>{course.lessons}</span>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: brand.muted, fontSize: 14 }}>
                          <AccessTimeIcon sx={{ fontSize: 18, color: brand.success }} />
                          <span>{course.duration}</span>
                        </Box>
                      </Stack>

                      <Button
                        variant="contained"
                        fullWidth
                        endIcon={<PlayArrowIcon />}
                        sx={{
                          mt: "auto",
                          bgcolor: brand.primary,
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          py: 1.25,
                          "&:hover": {
                            bgcolor: brand.primaryDark,
                          },
                        }}
                        onClick={() => navigate("/practice")}
                      >
                        Bắt đầu luyện tập
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderColor: brand.primary,
                color: brand.primary,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                  bgcolor: brand.primary50,
                  borderColor: brand.primaryDark,
                },
              }}
              onClick={() => navigate("/practice")}
            >
              Khám phá thêm
            </Button>
          </Box>
        </Container>
      </Box>

      {/* WHY LEARN CHINESE SECTION - With illustration */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: brand.bgCard }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center" sx={{ flexWrap: { xs: 'nowrap', md: 'nowrap' }, flexDirection: { xs: 'column', sm: 'row' } }}>
            {/* Left - Image */}
            <Grid item xs={12} sm={5} md={5} sx={{ flexShrink: 0 }}>
              <Box
                sx={{
                  position: "relative",
                  height: { xs: 280, sm: 350, md: 400 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                {/* Main Image */}
                <Box
                  component="img"
                  src={chineseCulture}
                  alt="Văn hóa Trung Quốc"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 4,
                    boxShadow: "0 20px 40px -12px rgba(0,0,0,0.15)",
                  }}
                />
                {/* Overlay with Chinese character */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 20,
                    right: 20,
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.95)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 40,
                      fontWeight: 700,
                      color: brand.primary,
                      fontFamily: "'Noto Serif SC', serif",
                    }}
                  >
                    中
                  </Typography>
                </Box>
                {/* Decorative badge */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: brand.primary,
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    boxShadow: `0 4px 12px ${brand.primary}40`,
                    fontFamily: "'Be Vietnam Pro', sans-serif",
                  }}
                >
                  <StarIcon sx={{ fontSize: 14 }} />
                  1.3 tỷ người nói
                </Box>
              </Box>
            </Grid>

            {/* Right - Content */}
            <Grid item xs={12} sm={7} md={7}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: brand.textPrimary,
                  mb: 2,
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                }}
              >
                Tại sao nên học{" "}
                <Box component="span" sx={{ color: brand.primary }}>Tiếng Trung</Box>?
              </Typography>
              <Typography sx={{ color: brand.muted, fontSize: 15, mb: 3, lineHeight: 1.7, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                Tiếng Trung là ngôn ngữ được sử dụng nhiều nhất thế giới với hơn 1.3 tỷ người nói.
                Việc thành thạo tiếng Trung mở ra cơ hội nghề nghiệp, kinh doanh và văn hóa vô hạn.
              </Typography>

              <Stack spacing={2}>
                {[
                  { icon: WorkspacePremiumIcon, title: "Cơ hội nghề nghiệp", desc: "Tăng 40% cơ hội việc làm với các công ty Trung Quốc" },
                  { icon: GroupIcon, title: "Kết nối toàn cầu", desc: "Giao tiếp với 1/5 dân số thế giới" },
                  { icon: BarChartIcon, title: "Phát triển tư duy", desc: "Cải thiện trí nhớ và khả năng phân tích" },
                ].map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <Box key={idx} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                      <Avatar
                        sx={{
                          bgcolor: `${brand.primary}12`,
                          width: 44,
                          height: 44,
                        }}
                      >
                        <ItemIcon sx={{ color: brand.primary, fontSize: 22 }} />
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: brand.textPrimary, mb: 0.5 }}>
                          {item.title}
                        </Typography>
                        <Typography sx={{ color: brand.muted, fontSize: 14 }}>
                          {item.desc}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>

              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  mt: 4,
                  bgcolor: brand.primary,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  boxShadow: `0 4px 14px ${brand.primary}40`,
                  "&:hover": {
                    bgcolor: brand.primaryDark,
                  },
                }}
                onClick={() => navigate("/practice")}
              >
                Bắt đầu học ngay
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FAQ SECTION */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: brand.bgSoft }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: brand.textPrimary,
                mb: 1.5,
                fontFamily: "'Be Vietnam Pro', sans-serif",
              }}
            >
              Câu Hỏi{" "}
              <Box component="span" sx={{ color: brand.primary }}>Thường Gặp</Box>
            </Typography>
            <Typography sx={{ color: brand.muted, fontSize: 16, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Giải đáp những thắc mắc phổ biến của học viên
            </Typography>
          </Box>

          <Stack spacing={2}>
            {faqs.map((faq, idx) => (
              <Accordion
                key={idx}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "rgba(0,0,0,0.06)",
                  borderRadius: "12px !important",
                  overflow: "hidden",
                  "&::before": { display: "none" },
                  "&.Mui-expanded": {
                    borderColor: `${brand.primary}30`,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: brand.primary }} />}
                  sx={{
                    py: 1,
                    "& .MuiAccordionSummary-content": {
                      my: 1.5,
                    },
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: brand.textPrimary }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 3, px: 3 }}>
                  <Typography sx={{ color: brand.textSecondary, lineHeight: 1.7 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* CTA SECTION */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.1)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.05)",
          }}
        />

        <Container sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center", maxWidth: 700, mx: "auto" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "#fff",
                mb: 2,
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontFamily: "'Be Vietnam Pro', sans-serif",
              }}
            >
              Sẵn sàng chinh phục tiếng Trung?
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontSize: 18,
                mb: 5,
                lineHeight: 1.7,
                fontFamily: "'Be Vietnam Pro', sans-serif",
              }}
            >
              Tham gia cùng hơn 10,000+ học viên đang học tại C-learning.
              Bắt đầu hành trình học tiếng Trung của bạn ngay hôm nay!
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: "#fff",
                  color: brand.primary,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 16,
                  px: 5,
                  py: 1.8,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.9)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  },
                }}
                onClick={() => navigate("/login")}
              >
                Đăng ký miễn phí
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "#fff",
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  px: 5,
                  py: 1.8,
                  "&:hover": {
                    borderColor: "#fff",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
                onClick={() => navigate("/courses")}
              >
                Xem khóa học
              </Button>
            </Stack>

            <Box sx={{ mt: 6, display: "flex", justifyContent: "center", gap: 4, flexWrap: "wrap" }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 28 }}>10K+</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>Học viên</Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 28 }}>500+</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>Bài học</Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 28 }}>95%</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>Hài lòng</Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 28 }}>24/7</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>Hỗ trợ</Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
