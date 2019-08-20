edge_array = [];
par =[0,0,0,0,0,0]
for par[0] in range(0,3):
	for par[1] in range(0,3):
		for par[2] in range(0,3):
			for par[3] in range(0,3):
				for par[4] in range(0,3):
					for par[5] in range(0,3):
						edge_array.append(str(par[0])+" "+str(par[1])+" "+str(par[2])+" "+str(par[3])+" "+str(par[4])+" "+str(par[5])+" 0")

i = 0
par2 =[0,0,0,0,0,0]
for par[0] in range(0,3):
	for par[1] in range(0,3):
		for par[2] in range(0,3):
			for par[3] in range(0,3):
				for par[4] in range(0,3):
					for par[5] in range(0,3):
						index = par[0]+par[1]*3+par[2]*9+par[3]*27+par[4]*81+par[5]*243
						if (index > i and index < 728):
								try:
									edge_array[index] = str(par[5])+" "+str(par[4])+" "+str(par[3])+" "+str(par[2])+" "+str(par[1])+" "+str(par[0])+" -1"
								except ValueError:
									pass
						j = 0
						for par_each in par:
							if (par_each == 1):
								par2[j] = 2
							elif (par_each == 2):
								par2[j] = 1
							else:
								par2[j] = 0
							j += 1
						index2 = par2[0]*243+par2[1]*81+par2[2]*27+par2[3]*9+par2[4]*3+par2[5]
						if (index2 > i and index2 < 728):
							try:
								edge_array[index2] = str(par2[0])+" "+str(par2[1])+" "+str(par2[2])+" "+str(par2[3])+" "+str(par2[4])+" "+str(par2[5])+" -1"
							except ValueError:
								pass
							
						i += 1




i=0
for edge_each in edge_array:
	print(edge_array[i])
	i += 1