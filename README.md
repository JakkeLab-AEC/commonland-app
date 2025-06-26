# Common Land (UNDER CONSTRUCTION)
![alt text](doc/readme/mainpage.png)

Tool for create topography, manage land based on borehole report.

![image](https://github.com/user-attachments/assets/c6425a4a-88c2-455a-af97-f308a50fc835)

IMPORTANT : 25-06-13 Currently some embedded local libraries are in progress to distribute on npm. <br/>
So please wait a little bit and I will notice when it finished. <br/>
- Local Libraries : Computational Geometry Library - https://github.com/JakkeLab-AEC/jakke-graphics-ts

---

## Introduction

### Main Feature
- Borehole data editor
- Visualize Borehole and create topography

### Main tech stacks
- Electorn, React, SQLite, Threejs, Zustand

---

### Current Version (0.0.2)
- The simple guide to use for this application is posted at : <br/>
  https://cheddar-napkin-4cc.notion.site/CommonLand-25-03-24-0-0-1-KR-1bfa42ff6f228083b612d4644b16003d?pvs=74
- Now it's written in Korean. Soon, I'll translate it as other languages (ENG, JPN)

---

## For developers (Underconstruction)

This app uses bundled python environment by Miniconda. So before build this app, you need to create miniconda environment.

Before creating miniconda environment, please install miniconda on your environment.
> How to install: <br/>
> https://www.anaconda.com/docs/getting-started/miniconda/install

### Create miniconda environment.
#### 1. Generate from miniconda environment config file.
```shell
# If your environment is macOS (Apple Sillicon):
conda env create --prefix ./envs/commonland_python_env_mac -f miniconda_environment.yaml

# If your environment is Windows:
conda env create --prefix ./envs/commonland_python_env_win -f miniconda_environment.yaml
```
- python 3.12 based
- pyKrige 1.7.2 included

#### 2. Check environment
```shell
# macOS
conda activate ./envs/commonland_python_env_mac

# Windows
conda activate ./envs/commonland_python_env_win

# Check the packages
conda list pykrige

## If conda environment well created, this will show on your console:

# Name      Version      Build                Channel
pykrige     1.7.2        <some-build-hash>    conda-forge
```

If pykrige does not appear in the package list, activate the environment and install it manually:

```shell
# macOS
conda activate ./envs/commonland_python_env_mac
conda install -c conda-forge pykrige

# Windows
conda activate ./envs/commonland_python_env_win
conda install -c conda-forge pykrige
```

Make sure you have conda-forge channel available. If not, you can add it using:
```shell
conda config --add channels conda-forge
```
Once installed, run:

```shell
conda list pykrige
```
to confirm that the package is successfully installed.

---

### Build

```shell
npm run package
```

### Run as dev mode
```shell
npm run dev
```

If error occurs like this, please remove dist folder and run build command again. macOS enviroment sometimes throws this error.
```shell
SystemError [ERR_FS_CP_EINVAL]: Invalid src or dest: cp returned EINVAL (cannot copy ~~)
```
---
