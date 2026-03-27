c++ -O3 -Wall -shared -std=c++17 -fPIC \
    $(python3 -m pybind11 --includes) \
    $(python3-config --ldflags --embed) \
    congestion.cpp \
    -o congestion_calc$(python3-config --extension-suffix)