import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Icon from '@/components/ui/icon';

type UserRole = 'user' | 'admin';

interface Enterprise {
  id: number;
  name: string;
  region: string;
  employees: number;
  repairStats: {
    completed: number;
    pending: number;
    overdue: number;
  };
  deviations: Deviation[];
  coordinates: { x: number; y: number };
}

interface Deviation {
  id: number;
  type: string;
  deadline: string;
  responsible: string;
  description: string;
  status: 'critical' | 'warning' | 'normal';
}

const mockEnterprises: Enterprise[] = [
  {
    id: 1,
    name: 'Московский завод',
    region: 'Москва',
    employees: 1247,
    repairStats: { completed: 89, pending: 12, overdue: 3 },
    deviations: [
      { id: 1, type: 'Превышение сроков ремонта', deadline: '2025-10-15', responsible: 'Иванов И.И.', description: 'Задержка поставки запчастей для оборудования цеха №3', status: 'critical' },
      { id: 2, type: 'Недокомплект персонала', deadline: '2025-10-20', responsible: 'Петров П.П.', description: 'Требуется 5 механиков для обслуживания нового оборудования', status: 'warning' }
    ],
    coordinates: { x: 55, y: 37 }
  },
  {
    id: 2,
    name: 'Санкт-Петербургский комбинат',
    region: 'Санкт-Петербург',
    employees: 892,
    repairStats: { completed: 76, pending: 8, overdue: 1 },
    deviations: [
      { id: 3, type: 'Превышение бюджета', deadline: '2025-11-01', responsible: 'Сидоров С.С.', description: 'Перерасход на закупку материалов составил 12%', status: 'warning' }
    ],
    coordinates: { x: 60, y: 30 }
  },
  {
    id: 3,
    name: 'Екатеринбургский завод',
    region: 'Свердловская область',
    employees: 1534,
    repairStats: { completed: 102, pending: 15, overdue: 2 },
    deviations: [
      { id: 4, type: 'Нарушение технологии', deadline: '2025-10-25', responsible: 'Козлов К.К.', description: 'Выявлено отклонение от технологического процесса в цехе №7', status: 'critical' }
    ],
    coordinates: { x: 57, y: 61 }
  },
  {
    id: 4,
    name: 'Новосибирский завод',
    region: 'Новосибирская область',
    employees: 678,
    repairStats: { completed: 45, pending: 6, overdue: 0 },
    deviations: [],
    coordinates: { x: 55, y: 83 }
  }
];

const Index = () => {
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise>(mockEnterprises[0]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedEnterprises, setSelectedEnterprises] = useState<number[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const regions = Array.from(new Set(mockEnterprises.map(e => e.region)));

  const filteredEnterprises = userRole === 'admin' 
    ? mockEnterprises.filter(e => 
        (selectedRegions.length === 0 || selectedRegions.includes(e.region)) &&
        (selectedEnterprises.length === 0 || selectedEnterprises.includes(e.id))
      )
    : [selectedEnterprise];

  const totalStats = filteredEnterprises.reduce((acc, e) => ({
    employees: acc.employees + e.employees,
    completed: acc.completed + e.repairStats.completed,
    pending: acc.pending + e.repairStats.pending,
    overdue: acc.overdue + e.repairStats.overdue,
    deviations: acc.deviations + e.deviations.length
  }), { employees: 0, completed: 0, pending: 0, overdue: 0, deviations: 0 });

  const allDeviations = filteredEnterprises.flatMap(e => 
    e.deviations.map(d => ({ ...d, enterpriseName: e.name }))
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Корпоративный портал</h1>
              <p className="text-sm text-muted-foreground">Система мониторинга предприятий</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={userRole} onValueChange={(value: UserRole) => setUserRole(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <Icon name="User" size={16} />
                      Пользователь
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Icon name="Shield" size={16} />
                      Администратор
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Icon name="Settings" size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b bg-card">
        <div className="container mx-auto px-6">
          <div className="flex gap-1">
            <Button variant="ghost" className="rounded-none border-b-2 border-primary px-4 py-3">
              <Icon name="BarChart3" size={18} className="mr-2" />
              Статистика
            </Button>
            <Button variant="ghost" className="rounded-none px-4 py-3 text-muted-foreground">
              <Icon name="Map" size={18} className="mr-2" />
              {userRole === 'admin' ? 'Все предприятия' : 'Мое предприятие'}
            </Button>
            <Button variant="ghost" className="rounded-none px-4 py-3 text-muted-foreground">
              <Icon name="FileText" size={18} className="mr-2" />
              Справка
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {userRole === 'admin' ? 'Все предприятия' : 'Мое предприятие'}
          </h2>
          {userRole === 'admin' && (
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Icon name="Filter" size={18} className="mr-2" />
                  Фильтры
                  {(selectedRegions.length > 0 || selectedEnterprises.length > 0) && (
                    <Badge variant="default" className="ml-2">
                      {selectedRegions.length + selectedEnterprises.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px]">
                <SheetHeader>
                  <SheetTitle>Фильтры</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-medium">Регионы</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedRegions(regions)}
                      >
                        Выбрать все
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {regions.map(region => (
                        <div key={region} className="flex items-center space-x-2">
                          <Checkbox 
                            id={region}
                            checked={selectedRegions.includes(region)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRegions([...selectedRegions, region]);
                              } else {
                                setSelectedRegions(selectedRegions.filter(r => r !== region));
                              }
                            }}
                          />
                          <label htmlFor={region} className="text-sm cursor-pointer">
                            {region}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-medium">Предприятия</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedEnterprises(mockEnterprises.map(e => e.id))}
                      >
                        Выбрать все
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {mockEnterprises.map(enterprise => (
                        <div key={enterprise.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`ent-${enterprise.id}`}
                            checked={selectedEnterprises.includes(enterprise.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedEnterprises([...selectedEnterprises, enterprise.id]);
                              } else {
                                setSelectedEnterprises(selectedEnterprises.filter(id => id !== enterprise.id));
                              }
                            }}
                          />
                          <label htmlFor={`ent-${enterprise.id}`} className="text-sm cursor-pointer">
                            {enterprise.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedRegions([]);
                        setSelectedEnterprises([]);
                      }}
                    >
                      Сбросить
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => setFilterOpen(false)}
                    >
                      Применить
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="MapPin" size={20} />
                  Карта РФ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-[500px] overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <rect x="10" y="20" width="80" height="60" rx="4" fill="#e0e7ff" stroke="#6366f1" strokeWidth="0.3" />
                    
                    {filteredEnterprises.map((enterprise) => (
                      <g 
                        key={enterprise.id}
                        className="cursor-pointer transition-transform hover:scale-110"
                        onClick={() => setSelectedEnterprise(enterprise)}
                      >
                        <circle 
                          cx={enterprise.coordinates.x} 
                          cy={enterprise.coordinates.y} 
                          r="3" 
                          fill={enterprise.deviations.length > 0 ? '#dc2626' : '#059669'}
                          className="animate-pulse"
                        />
                        <circle 
                          cx={enterprise.coordinates.x} 
                          cy={enterprise.coordinates.y} 
                          r="5" 
                          fill={enterprise.deviations.length > 0 ? '#dc2626' : '#059669'}
                          opacity="0.3"
                        />
                        <text 
                          x={enterprise.coordinates.x} 
                          y={enterprise.coordinates.y - 7} 
                          fontSize="3" 
                          fill="#1e293b"
                          textAnchor="middle"
                          className="font-medium"
                        >
                          {enterprise.name.split(' ')[0]}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {userRole === 'admin' ? 'Сводная информация' : selectedEnterprise.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Регион</div>
                  <div className="font-medium">
                    {userRole === 'admin' 
                      ? `${selectedRegions.length > 0 ? selectedRegions.join(', ') : 'Все регионы'}`
                      : selectedEnterprise.region
                    }
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm text-muted-foreground">Сотрудников</div>
                  <div className="text-2xl font-bold">{totalStats.employees.toLocaleString()}</div>
                </div>

                <Separator />

                <div>
                  <div className="mb-2 text-sm font-medium">Статистика ремонта</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Завершено</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {totalStats.completed}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">В работе</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {totalStats.pending}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Просрочено</span>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        {totalStats.overdue}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Отклонения</span>
                    <Badge variant="destructive">{totalStats.deviations}</Badge>
                  </div>
                  {allDeviations.length > 0 ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full" size="sm">
                          <Icon name="Info" size={16} className="mr-2" />
                          Подробнее
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Информация об отклонениях</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[500px] space-y-4 overflow-y-auto">
                          {allDeviations.map((deviation: any) => (
                            <Card key={deviation.id}>
                              <CardContent className="pt-6">
                                <div className="mb-3 flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium">{deviation.type}</h4>
                                    {userRole === 'admin' && (
                                      <p className="text-sm text-muted-foreground">{deviation.enterpriseName}</p>
                                    )}
                                  </div>
                                  <Badge variant={deviation.status === 'critical' ? 'destructive' : 'outline'}>
                                    {deviation.status === 'critical' ? 'Критично' : 'Предупреждение'}
                                  </Badge>
                                </div>
                                <p className="mb-3 text-sm">{deviation.description}</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Срок:</span>
                                    <div className="font-medium">
                                      {new Date(deviation.deadline).toLocaleDateString('ru-RU')}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Ответственный:</span>
                                    <div className="font-medium">{deviation.responsible}</div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="rounded-lg bg-green-50 p-3 text-center text-sm text-green-700">
                      Отклонений не обнаружено
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
