const gradeOptions = {
  Primary: {
    'Grade 1': ['1', '2', '3', '4', '5'],
    'Grade 2': ['1', '2', '3', '4', '5'],
    'Grade 3': ['1', '2', '3', '4', '5'],
    'Grade 4': ['1', '2', '3', '4', '5'],
    'Grade 5': ['1', '2', '3', '4', '5'],
    'Grade 6': ['1', '2', '3', '4', '5'],
  },
  Secondary: {
    'Grade 7': ['1', '2', '3', '4', '5'],
    'Grade 8': ['1', '2', '3', '4', '5'],
    'Grade 9': ['1', '2', '3', '4', '5'],
    'Grade 10': ['1', '2', '3', '4', '5'],
    '---': [], // Border
    'Grade 11 HUMSS': ['HUMSS 1', 'HUMSS 2', 'HUMSS 3', 'HUMSS 4', 'HUMSS 5'],
    'Grade 11 ABM': ['ABM 1', 'ABM 2', 'ABM 3', 'ABM 4', 'ABM 5'],
    'Grade 11 A&D': ['A&D 1', 'A&D 2', 'A&D 3', 'A&D 4', 'A&D 5'],
    'Grade 11 F&B': ['F&B 1', 'F&B 2', 'F&B 3', 'F&B 4', 'F&B 5'],
    'Grade 11 B&P': ['B&P 1', 'B&P 2', 'B&P 3', 'B&P 4', 'B&P 5'],
    'Grade 11 TS': ['TS 1', 'TS 2', 'TS 3', 'TS 4', 'TS 5'],
    'Grade 11 ICT': ['ICT 1', 'ICT 2', 'ICT 3', 'ICT 4', 'ICT 5'],
    '----': [], // Border
    'Grade 12 HUMSS': ['HUMSS 1', 'HUMSS 2', 'HUMSS 3', 'HUMSS 4', 'HUMSS 5'],
    'Grade 12 ABM': ['ABM 1', 'ABM 2', 'ABM 3', 'ABM 4', 'ABM 5'],
    'Grade 12 A&D': ['A&D 1', 'A&D 2', 'A&D 3', 'A&D 4', 'A&D 5'],
    'Grade 12 F&B': ['F&B 1', 'F&B 2', 'F&B 3', 'F&B 4', 'F&B 5'],
    'Grade 12 B&P': ['B&P 1', 'B&P 2', 'B&P 3', 'B&P 4', 'F&B 5'],
    'Grade 12 TS': ['TS 1', 'TS 2', 'TS 3', 'TS 4', 'TS 5'],
    'Grade 12 ICT': ['ICT 1', 'ICT 2', 'ICT 3', 'ICT 4', 'ICT 5'],
  },
  Tertiary: {
    'BSCS 1ST YEAR': ['1 A', '1 B', '1 C', '1 D', '1 E'],
    'BSCS 2ND YEAR': ['2 A', '2 B', '2 C', '2 D', '2 E'],
    'BSCS 3RD YEAR': ['3 A', '3 B', '3 C', '3 D', '3 E'],
    'BSCS 4TH YEAR': ['4 A', '4 B', '4 C', '4 D', '4 E'],
    '---BSHM': [], // Border
    'BSHM 1ST YEAR': ['1 A', '1 B', '1 C', '1 D', '1 E'],
    'BSHM 2ND YEAR': ['2 A', '2 B', '2 C', '2 D', '2 E'],
    'BSHM 3RD YEAR': ['3 A', '3 B', '3 C', '3 D', '3 E'],
    'BSHM 4TH YEAR': ['4 A', '4 B', '4 C', '4 D', '4 E'],
    '---BSTM': [], // Border
    'BSTM 1ST YEAR': ['1 A', '1 B', '1 C', '1 D', '1 E'],
    'BSTM 2ND YEAR': ['2 A', '2 B', '2 C', '2 D', '2 E'],
    'BSTM 3RD YEAR': ['3 A', '3 B', '3 C', '3 D', '3 E'],
    'BSTM 4TH YEAR': ['4 A', '4 B', '4 C', '4 D', '4 E'],
    '---BSPolSci': [], // Border
    'BSPolSci 1ST YEAR': ['1 A', '1 B', '1 C', '1 D', '1 E'],
    'BSPolSci 2ND YEAR': ['2 A', '2 B', '2 C', '2 D', '2 E'],
    'BSPolSci 3RD YEAR': ['3 A', '3 B', '3 C', '3 D', '3 E'],
    'BSPolSci 4TH YEAR': ['4 A', '4 B', '4 C', '4 D', '4 E'],
    '---BSBA': [], // Border
    'BSBA 1ST YEAR': ['1 A', '1 B', '1 C', '1 D', '1 E'],
    'BSBA 2ND YEAR': ['2 A', '2 B', '2 C', '2 D', '2 E'],
    'BSBA 3RD YEAR': ['3 A', '3 B', '3 C', '3 D', '3 E'],
    'BSBA 4TH YEAR': ['4 A', '4 B', '4 C', '4 D', '4 E'],
    '---BEED': [], // Border
    'BEED 1ST YEAR': ['1 A', '1 B', '1 C', '1 D', '1 E'],
    'BEED 2ND YEAR': ['2 A', '2 B', '2 C', '2 D', '2 E'],
    'BEED 3RD YEAR': ['3 A', '3 B', '3 C', '3 D', '3 E'],
    'BEED 4TH YEAR': ['4 A', '4 B', '4 C', '4 D', '4 E'],
    '---BSED-ENG': [], // Border
    'BSED-ENG 1ST YEAR': ['1 A', '1 B', '1 C', '1 D', '1 E'],
    'BSED-ENG 2ND YEAR': ['2 A', '2 B', '2 C', '2 D', '2 E'],
    'BSED-ENG 3RD YEAR': ['3 A', '3 B', '3 C', '3 D', '3 E'],
    'BSED-ENG 4TH YEAR': ['4 A', '4 B', '4 C', '4 D', '4 E'],
    '---BSED-MATH': [], // Border
    'BSED-MATH 1ST YEAR': ['1 A', '1 B', '1 C', '1 D', '1 E'],
    'BSED-MATH 2ND YEAR': ['2 A', '2 B', '2 C', '2 D', '2 E'],
    'BSED-MATH 3RD YEAR': ['3 A', '3 B', '3 C', '3 D', '3 E'],
    'BSED-MATH 4TH YEAR': ['4 A', '4 B', '4 C', '4 D', '4 E'],
  },
};

export default gradeOptions;