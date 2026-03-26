#include <pybind11/pybind11.h>
#include <algorithm>
#include <cmath>
#include <string>

namespace py = pybind11;

double calculate_congestion_score(double current_speed, double free_flow_speed) {
    if (free_flow_speed <= 0.0) return 0.0;
    double score = 1.0 - (current_speed / free_flow_speed);
    return std::round(std::max(0.0, std::min(1.0, score)) * 100.0) / 100.0;
}

std::string classify_congestion(double score) {
    if (score < 0.3) return "LOW";
    if (score < 0.6) return "MODERATE";
    if (score < 0.8) return "HIGH";
    return "SEVERE";
}

int recommend_green_duration(double score) {
    if (score < 0.3) return 20;
    if (score < 0.6) return 35;
    if (score < 0.8) return 50;
    return 65;
}

PYBIND11_MODULE(congestion_calc, m) {
    m.doc() = "C++ congestion calculator";
    m.def("calculate_congestion_score", &calculate_congestion_score);
    m.def("classify_congestion", &classify_congestion);
    m.def("recommend_green_duration", &recommend_green_duration);
}